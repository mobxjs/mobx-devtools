const { assert } = require('chai');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const WebSocket = require('ws');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

const extensionPath = path.join(__dirname, '../../lib/chrome');
const DEBUG_PORT = 9333;
const CMD_KEY = process.platform === 'darwin' ? 'Meta' : 'Control';

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

// Extension iframes inside DevTools (e.g. panel-loader.html) live in a separate
// process that Playwright can't reach via page.frames(). This helper sends a
// single CDP evaluate call over a raw WebSocket to such a target.
function cdpEvaluate(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression, returnByValue: true, awaitPromise: true },
        }),
      );
    });
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.id === 1) {
        ws.close();
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
    ws.on('error', reject);
    setTimeout(() => {
      ws.close();
      reject(new Error('CDP evaluate timeout'));
    }, 15000);
  });
}

describe('DevTools panel', function test() {
  let cdpBrowser;
  let context;
  let mainPage;
  let panelFrame;
  let closePlayground;
  let userDataDir;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ pages: ['baltimore'] });
    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobx-devtools-panel-test-'));

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        `--auto-open-devtools-for-tabs`,
        `--remote-debugging-port=${DEBUG_PORT}`,
      ],
    });

    mainPage = context.pages()[0] || (await context.newPage());
    await mainPage.goto('http://localhost:8082/baltimore.html');

    // The panel-loader polls for MobX then calls chrome.devtools.panels.create().
    // In automated runs the polling can miss, so we trigger creation explicitly.
    // panel-loader.html is in a separate process, so we must use raw CDP here.
    // Poll until the panel-loader target appears (extension needs time to initialize).
    let loaderTarget;
    for (let i = 0; i < 30 && !loaderTarget; i++) {
      const targets = await httpGetJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
      loaderTarget = targets.find(t => t.url.includes('panel-loader.html'));
      if (!loaderTarget) await mainPage.waitForTimeout(500);
    }
    assert.ok(loaderTarget, 'panel-loader.html target should exist');

    await cdpEvaluate(
      loaderTarget.webSocketDebuggerUrl,
      `new Promise(resolve => {
        chrome.devtools.panels.create('MobX', '', 'panel.html', () => resolve());
      })`,
    );

    // Connect to the DevTools page via CDP (Playwright doesn't expose devtools:// pages directly)
    const { webSocketDebuggerUrl } = await httpGetJson(
      `http://127.0.0.1:${DEBUG_PORT}/json/version`,
    );
    cdpBrowser = await chromium.connectOverCDP(webSocketDebuggerUrl);

    const devtoolsPage = cdpBrowser
      .contexts()
      .flatMap(ctx => ctx.pages())
      .find(page => page.url().includes('devtools://devtools'));
    assert.ok(devtoolsPage, 'DevTools page should be reachable');

    // panel.html only loads when the MobX tab is selected. Cycle through
    // DevTools tabs with keyboard until the panel frame appears.
    await devtoolsPage.bringToFront();

    for (let i = 0; i < 15 && !panelFrame; i++) {
      await devtoolsPage.keyboard.press(`${CMD_KEY}+]`);
      await devtoolsPage.waitForTimeout(300);
      panelFrame = devtoolsPage
        .frames()
        .find(f => f.url().includes('panel.html') && !f.url().includes('panel-loader'));
    }
    assert.ok(panelFrame, 'panel.html frame should appear after cycling tabs');

    // Wait for the React UI inside the panel to render
    await panelFrame.locator('[data-test="MainMenu-Tab-changes"]').waitFor({ timeout: 15000 });
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (cdpBrowser) await cdpBrowser.close().catch(() => {});
    if (context) await context.close();
    if (userDataDir) fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  it('should load MobX panel and record changes', async () => {
    // Verify the panel UI loaded
    const tabs = panelFrame.locator('[data-test^="MainMenu-Tab"]');
    assert.isAtLeast(await tabs.count(), 1, 'Should have at least one tab');

    // Start recording and wait for the tip to disappear (confirms recording is active)
    await panelFrame.locator('[data-hook="ButtonRecord"]').click();
    await panelFrame.locator('text=Click to start recording').waitFor({ state: 'hidden' });

    // Trigger MobX actions on the main page
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '–' }).click();

    // Verify log entries appeared in the panel
    await panelFrame.locator('text=manuallyIncrease').first().waitFor();
    await panelFrame.locator('text=manuallyDecrease').first().waitFor();
    assert.isAtLeast(
      await panelFrame.locator('text=manuallyIncrease').count(),
      1,
      'Expected manuallyIncrease log entries',
    );
    assert.isAtLeast(
      await panelFrame.locator('text=manuallyDecrease').count(),
      1,
      'Expected manuallyDecrease log entries',
    );
  });
});
