const { assert } = require('chai');
const prepare = require('../prepare');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

describe('Components (observers) devtool', function test() {
  let driver;
  let teardown;
  let closePlayground;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ port: 8082, pages: ['baltimore'] });
    ({ driver, teardown } = await prepare({ initialUrl: 'http://localhost:8082/baltimore.html' }));
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (teardown) await teardown();
  });

  // This test used to check for the components tab which has been removed, but we will leave the test set up here for the future.
  it('should load components tree', async () => {
    assert.ok(true);
    await new Promise(resolve => setTimeout(resolve, 10000));
  });
});
