const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const webdriver = require('selenium-webdriver');
const path = require('path');

const { TARGET_BROWSER } = process.env;

const startBrowser = () => {
  switch (TARGET_BROWSER) {
    case 'chrome':
      chromedriver.start();
      return () => chromedriver.stop();
    case 'firefox':
      geckodriver.start();
      return () => geckodriver.stop();
    default:
      throw new Error(`${TARGET_BROWSER} browser driver is not configured`);
  }
};

const getServerAddr = () => {
  switch (TARGET_BROWSER) {
    case 'chrome':
      return 'http://localhost:9515';
    case 'firefox':
      return 'http://localhost:4444';
    default:
      throw new Error(`${TARGET_BROWSER} browser server address is not configured`);
  }
};

const getCapabilities = () => {
  switch (TARGET_BROWSER) {
    case 'chrome':
      return {
        chromeOptions: {
          args: [`load-extension=${path.join(__dirname, '../lib/chrome')}`],
        },
      };
    // TODO: Run unsigned extension in ff
    // case 'firefox': return {
    //   'moz:firefoxOptions': {},
    // };
    default:
      throw new Error(`${TARGET_BROWSER} browser capabilities are not configured`);
  }
};

module.exports = async ({ initialUrl, openDevtool = true }) => {
  const stopBrowser = startBrowser();
  const driver = new webdriver.Builder()
    .usingServer(getServerAddr())
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
      "window.dispatchEvent(new Event('test-open-mobx-devtools-window'));",
    );
    await driver.wait(
      async () => (await driver.getAllWindowHandles()).length > 1,
      5000,
      "Devtools wasn't open",
    );
    devtoolWindowHandle = (await driver.getAllWindowHandles()).find(h => h !== mainWindowHandle);

    await driver.switchTo().window(devtoolWindowHandle);
  }

  const teardown = async () => {
    await driver.quit();
    stopBrowser();
  };

  return {
    driver,
    mainWindowHandle,
    devtoolWindowHandle,
    teardown,
  };
};
