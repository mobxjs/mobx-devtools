const { assert } = require('chai');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const WebSocket = require('ws');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

const extensionPath = path.join(__dirname, '../../lib/chrome');
const debugPort = 9333;
const cmdKey = process.platform === 'darwin' ? 'Meta' : 'Control';

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

/**
 * Persistent CDP connection to a target via raw WebSocket.
 * Panel.html is an iframe target inside DevTools, so Playwright can't get a Page
 * object for it. This thin wrapper lets us evaluate JS in the panel directly.
 */
class CDPConnection {
  constructor(wsUrl) {
    this._ws = null;
    this._wsUrl = wsUrl;
    this._nextId = 1;
    this._pending = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this._ws = new WebSocket(this._wsUrl);
      this._ws.on('open', resolve);
      this._ws.on('message', data => {
        const msg = JSON.parse(data.toString());
        const entry = this._pending.get(msg.id);
        if (entry) {
          this._pending.delete(msg.id);
          msg.error ? entry.reject(new Error(msg.error.message)) : entry.resolve(msg.result);
        }
      });
      this._ws.on('error', reject);
    });
  }

  async evaluate(expression) {
    const id = this._nextId++;
    const result = await new Promise((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      this._ws.send(
        JSON.stringify({
          id,
          method: 'Runtime.evaluate',
          params: { expression, returnByValue: true, awaitPromise: true },
        }),
      );
      setTimeout(() => {
        if (this._pending.delete(id)) reject(new Error('CDP evaluate timeout'));
      }, 15000);
    });
    return JSON.parse(result.result?.value || 'null');
  }

  close() {
    if (this._ws) this._ws.close();
  }
}

describe('DevTools panel', function test() {
  let cdpBrowser;
  let context;
  let mainPage;
  let panelCDP;
  let closePlayground;
  let userDataDir;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ port: 8082, pages: ['baltimore'] });
    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobx-devtools-panel-test-'));

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        `--auto-open-devtools-for-tabs`,
        `--remote-debugging-port=${debugPort}`,
        '--window-size=1800,1000',
      ],
    });

    mainPage = context.pages()[0] || (await context.newPage());
    await mainPage.goto('http://localhost:8082/baltimore.html');
    await mainPage.waitForTimeout(8000);

    // The panel-loader polls for MobX on the page then calls
    // chrome.devtools.panels.create(). In automated runs the polling can miss,
    // so we trigger panel creation explicitly from the panel-loader context.
    const targets = await httpGetJson(`http://127.0.0.1:${debugPort}/json`);
    const loaderTarget = targets.find(t => t.url.includes('panel-loader.html'));
    assert.ok(loaderTarget, 'panel-loader.html target should exist');

    const loaderCDP = new CDPConnection(loaderTarget.webSocketDebuggerUrl);
    await loaderCDP.connect();
    await loaderCDP.evaluate(`new Promise(resolve => {
      chrome.devtools.panels.create('MobX', '', 'panel.html', () => resolve(JSON.stringify('ok')));
    })`);
    loaderCDP.close();
    await mainPage.waitForTimeout(2000);

    // panel.html only loads when the MobX tab is selected. Cycle through
    // DevTools tabs with keyboard until the panel target appears.
    const { webSocketDebuggerUrl } = await httpGetJson(
      `http://127.0.0.1:${debugPort}/json/version`,
    );
    cdpBrowser = await chromium.connectOverCDP(webSocketDebuggerUrl);

    let devtoolsPage;
    for (const ctx of cdpBrowser.contexts()) {
      for (const page of ctx.pages()) {
        if (page.url().includes('devtools://devtools')) {
          devtoolsPage = page;
          break;
        }
      }
    }
    assert.ok(devtoolsPage, 'DevTools page should be reachable');
    await devtoolsPage.bringToFront();

    let panelTarget;
    for (let i = 0; i < 15; i++) {
      await devtoolsPage.keyboard.press(`${cmdKey}+]`);
      await devtoolsPage.waitForTimeout(300);

      const current = await httpGetJson(`http://127.0.0.1:${debugPort}/json`);
      panelTarget = current.find(
        t => t.url.includes('panel.html') && !t.url.includes('panel-loader'),
      );
      if (panelTarget) break;
    }
    assert.ok(panelTarget, 'panel.html target should appear after cycling tabs');

    panelCDP = new CDPConnection(panelTarget.webSocketDebuggerUrl);
    await panelCDP.connect();

    // Wait for the React UI inside the panel to render
    await mainPage.waitForTimeout(5000);
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (panelCDP) panelCDP.close();
    if (cdpBrowser) await cdpBrowser.close().catch(() => {});
    if (context) await context.close();
    if (userDataDir) fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  it('should load MobX panel and record changes', async () => {
    // Verify the panel UI loaded
    const tabs = await panelCDP.evaluate(`JSON.stringify(
      Array.from(document.querySelectorAll('[data-test^="MainMenu-Tab"]'))
        .map(t => t.textContent.trim())
    )`);
    assert.include(tabs, 'Changes', 'Changes tab should be visible');

    // Start recording
    await panelCDP.evaluate(`JSON.stringify((function() {
      var toolbar = document.querySelector('input[placeholder="Search (string/regex)"]').parentElement;
      toolbar.querySelector(':scope > div').click();
      return 'ok';
    })())`);
    await mainPage.waitForTimeout(500);

    // Trigger MobX actions on the main page
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '–' }).click();
    await mainPage.waitForTimeout(2000);

    // Verify log entries appeared in the panel
    const html = await panelCDP.evaluate(`JSON.stringify(document.body.innerHTML)`);
    assert.include(html, 'manuallyIncrease', 'Expected manuallyIncrease log entries');
    assert.include(html, 'manuallyDecrease', 'Expected manuallyDecrease log entries');
  });
});
