const { assert } = require('chai');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const geckoPath = require('geckodriver').path;
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

// Use Playwright's bundled Firefox binary (Nightly) unless FIREFOX_BIN is set
const firefoxBin = process.env.FIREFOX_BIN || require('playwright').firefox.executablePath();

const extensionPath = path.join(__dirname, '../../lib/firefox');
const GECKODRIVER_PORT = 4445;

// Thin WebDriver client — talks to geckodriver over HTTP.
// geckodriver's moz/addon/install endpoint is the only reliable way
// to load an unsigned extension in Firefox.
function wd(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: GECKODRIVER_PORT,
        path: urlPath,
        method,
        headers: { 'Content-Type': 'application/json' },
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      },
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function exec(sessionId, script) {
  return wd('POST', `/session/${sessionId}/execute/sync`, { script, args: [] }).then(r => r.value);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe('Firefox sanity', function test() {
  let geckodriver;
  let sessionId;
  let mainWindowHandle;
  let devtoolWindowHandle;
  let closePlayground;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ pages: ['baltimore'] });

    geckodriver = spawn(geckoPath, ['--port', String(GECKODRIVER_PORT)], { stdio: 'ignore' });
    await sleep(1000);

    const session = await wd('POST', '/session', {
      capabilities: {
        alwaysMatch: {
          browserName: 'firefox',
          'moz:firefoxOptions': { binary: firefoxBin },
        },
      },
    });
    sessionId = session.value?.sessionId;
    assert.ok(sessionId, 'Firefox session should be created');

    const addon = await wd('POST', `/session/${sessionId}/moz/addon/install`, {
      path: extensionPath,
      temporary: true,
    });
    assert.ok(!addon.value?.error, `Addon should install: ${addon.value?.message || 'ok'}`);

    // Navigate to playground
    await wd('POST', `/session/${sessionId}/url`, { url: 'http://localhost:8082/baltimore.html' });
    await sleep(3000);
    mainWindowHandle = (await wd('GET', `/session/${sessionId}/window`)).value;

    // Open devtools popup window via test helper event
    await exec(sessionId, 'window.dispatchEvent(new Event("test-open-mobx-devtools-window"))');
    await sleep(3000);

    // Switch to the devtools window
    const handles = (await wd('GET', `/session/${sessionId}/window/handles`)).value;
    devtoolWindowHandle = handles.find(h => h !== mainWindowHandle);
    assert.ok(devtoolWindowHandle, 'DevTools window should open');
  });

  after(async () => {
    if (sessionId) await wd('DELETE', `/session/${sessionId}`).catch(() => {});
    if (geckodriver) geckodriver.kill();
    if (closePlayground) closePlayground();
  });

  it('should record and display MobX changes', async () => {
    // Switch to devtools window
    await wd('POST', `/session/${sessionId}/window`, { handle: devtoolWindowHandle });

    // Start recording
    await exec(sessionId, 'document.querySelector(\'[data-hook="ButtonRecord"]\').click()');
    await sleep(500);

    // Switch to main page and trigger MobX actions
    await wd('POST', `/session/${sessionId}/window`, { handle: mainWindowHandle });
    await exec(
      sessionId,
      'Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("+")).click()',
    );
    await exec(
      sessionId,
      'Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("+")).click()',
    );
    await sleep(3000);

    // Switch back to devtools and verify log entries appeared
    await wd('POST', `/session/${sessionId}/window`, { handle: devtoolWindowHandle });
    const html = await exec(sessionId, 'return document.body.innerHTML');
    assert.include(html, 'manuallyIncrease', 'Expected manuallyIncrease log entries');
  });
});
