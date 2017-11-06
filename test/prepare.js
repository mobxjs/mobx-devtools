const chromedriver = require('chromedriver');
const webdriver = require('selenium-webdriver');
const path = require('path');

const TARGET_BROWSER = process.env.TARGET_BROWSER;

const startBrowser = () => {
  switch (TARGET_BROWSER) {
    case 'chrome':
      chromedriver.start();
      return () => chromedriver.stop();
    default:
      return () => {};
  }
};

const getCapabilities = () => {
  switch (TARGET_BROWSER) {
    case 'chrome': return {
      chromeOptions: {
        args: [`load-extension=${path.join(__dirname, '../lib/chrome')}`],
      },
    };
    default: return {};
  }
};

module.exports = async ({ initialUrl, openDevtool = true }) => {
  const stopBrowser = startBrowser();
  const driver = new webdriver.Builder()
    .usingServer('http://localhost:9515')
    .withCapabilities(getCapabilities())
    .forBrowser(TARGET_BROWSER)
    .build();

  if (initialUrl) {
    await driver.get(initialUrl);
  }

  const mainWindowHandle = await driver.getWindowHandle();
  let devtoolWindowHandle;

  if (openDevtool) {
    await driver.executeScript(
      'window.dispatchEvent(new Event(\'test-open-mobx-devtools-window\'));'
    );
    await driver.wait(
      async () => (await driver.getAllWindowHandles()).length > 1,
      5000,
      'Devtools wasn\'t open'
    );
    devtoolWindowHandle =
      (await driver.getAllWindowHandles()).find(h => h !== mainWindowHandle);

    await driver.switchTo().window(devtoolWindowHandle);
  }

  const teardown = async () => {
    await driver.quit();
    stopBrowser();
  };

  return { driver, mainWindowHandle, devtoolWindowHandle, teardown };
};
