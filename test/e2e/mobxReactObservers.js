const { By } = require('selenium-webdriver');
const prepare = require('../prepare');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

const componentsButtonLocator = By.css('[data-test="MainMenu-Tab-components"]');
const componentsTreeNodeHead = By.css('[data-test="components-Node-Head"]');

describe('Components (observers) devtool', function test() {
  let driver;
  let teardown;
  let closePlayground;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ port: 8082, pages: ['baltimore'] });
    ({ driver, teardown } = await prepare({ initialUrl: 'http://localhost:8082/baltimore.html' }));

    await driver.wait(
      async () => (await driver.findElements(componentsButtonLocator)).length > 0,
      10000,
      "Components tab wasn't shown",
    );

    await driver
      .actions()
      .click(await driver.findElement(componentsButtonLocator))
      .perform();
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (teardown) await teardown();
  });

  it('should load components tree', async () => {
    await driver.wait(
      async () => (await driver.findElements(componentsTreeNodeHead)).length > 0,
      5000,
    );
  });
});
