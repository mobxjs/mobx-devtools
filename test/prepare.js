const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const extensionPath = path.join(__dirname, '../lib/chrome');

module.exports = async ({ initialUrl, openDevtool = true }) => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobx-devtools-test-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  // Use the first existing page or open a new one
  const mainPage = context.pages()[0] || (await context.newPage());

  if (initialUrl) {
    await mainPage.goto(initialUrl);
  }

  let devtoolPage;

  if (openDevtool) {
    // Wait for the devtool popup window to open after dispatching the event
    const pagePromise = context.waitForEvent('page', { timeout: 8000 });

    await mainPage.evaluate(() =>
      window.dispatchEvent(new Event('test-open-mobx-devtools-window')),
    );

    devtoolPage = await pagePromise;
    await devtoolPage.waitForLoadState();
  }

  const teardown = async () => {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  };

  // Return a driver-like object for compatibility with test files
  const driver = mainPage;

  return {
    driver,
    mainWindowHandle: mainPage,
    devtoolWindowHandle: devtoolPage,
    teardown,
  };
};
