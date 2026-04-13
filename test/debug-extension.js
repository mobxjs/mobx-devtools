/**
 * Quick diagnostic script to check extension loading
 * Run: NODE_ENV=test TARGET_BROWSER=chrome node test/debug-extension.js
 */
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

const chromedriverPath = require.resolve(
  '../packages/playground/node_modules/chromedriver/lib/chromedriver/chromedriver',
);
const extensionPath = path.join(__dirname, '../lib/chrome');

async function main() {
  const options = new chrome.Options();
  options.addArguments(`--load-extension=${extensionPath}`);

  const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeService(new chrome.ServiceBuilder(chromedriverPath))
    .setChromeOptions(options)
    .build();

  try {
    // Navigate to about:blank first
    await driver.get('about:blank');
    await driver.sleep(1000);

    // Check extensions-internals
    await driver.get('chrome://extensions-internals');
    await driver.sleep(500);
    const internals = await driver.executeScript(
      'return document.body.innerText.length + ": " + document.body.innerText.substring(0, 3000)',
    );
    console.log('Extensions internals:', internals);

    // Navigate to a simple HTTP page and check content script
    await driver.get('http://localhost:8082/baltimore.html');
    await driver.sleep(2000);

    const csAttr = await driver.executeScript(
      "return document.documentElement.getAttribute('data-mobx-devtools-loaded')",
    );
    const mobxHook = await driver.executeScript(
      'return typeof window.__MOBX_DEVTOOLS_GLOBAL_HOOK__',
    );
    console.log('Content script loaded attr:', csAttr);
    console.log('MobX hook type:', mobxHook);
  } finally {
    await driver.quit();
  }
}

main().catch(console.error);
