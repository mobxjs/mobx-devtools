const { assert } = require('chai');
const prepare = require('../prepare');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

describe('MST tab', function test() {
  let mainPage;
  let devtoolPage;
  let teardown;
  let closePlayground;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ port: 8082, pages: ['casablanca'] });
    const result = await prepare({ initialUrl: 'http://localhost:8082/casablanca.html' });
    mainPage = result.mainWindowHandle;
    devtoolPage = result.devtoolWindowHandle;
    teardown = result.teardown;
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (teardown) await teardown();
  });

  const addTodo = async (title) => {
    const input = mainPage.locator('input');
    await input.fill(title);
    await input.press('Enter');
  };

  const clickClearButton = async () => {
    // Click the parent div of the ClearIcon SVG (which has a unique circle with r="5.75")
    await devtoolPage.locator('svg:has(circle[r="5.75"])').locator('..').click();
  };

  it('should detect MST and display log entries', async () => {
    // The MST tab should appear since casablanca uses mobx-state-tree
    const mstTab = devtoolPage.locator('[data-test="MainMenu-Tab-mst"]');
    await mstTab.waitFor({ timeout: 15000 });
    await mstTab.click();
    await devtoolPage.waitForTimeout(500);

    // MST recording auto-starts (mstLogEnabled defaults to true),
    // so the initial snapshot should appear without clicking record
    const initialItem = devtoolPage.locator('text=Initial');
    await initialItem.waitFor({ timeout: 10000 });
    assert.isTrue(await initialItem.isVisible(), 'Initial snapshot should appear');

    // Add todos to trigger MST patches
    await addTodo('Buy milk');
    await addTodo('Walk the dog');
    await devtoolPage.waitForTimeout(2000);

    // Log items with patches should appear
    const patchItems = devtoolPage.locator('text=/\\d+ patch/');
    assert.isAtLeast(await patchItems.count(), 2, 'Expected at least 2 patch log entries');

    // Player progress should reflect all log items (initial + patches)
    const playerProgress = devtoolPage.locator('text=/\\d+ \\/ \\d+/');
    const progressText = await playerProgress.innerText();
    const total = Number(progressText.split('/')[1].trim());
    assert.isAtLeast(total, 3, 'Player should show at least 3 items');
  });

  it('should show snapshot details when a log item is selected', async () => {
    // Click a patch log item (not "Initial" which has no snapshot)
    await devtoolPage.locator('text=/\\d+ patch/').first().click();
    await devtoolPage.waitForTimeout(2000);

    // The LogItemExplorer should show a "State" collapsible with the snapshot
    const stateHeader = devtoolPage.locator('text=State');
    await stateHeader.waitFor({ timeout: 5000 });
    assert.isTrue(await stateHeader.isVisible(), '"State" section should be visible');

    // Patch details should reference the todos path
    const pageContent = await devtoolPage.content();
    assert.isTrue(pageContent.includes('todos'), 'Patch details should reference todos path');
  });

  it('should clear log entries', async () => {
    assert.isAtLeast(await devtoolPage.locator('text=/\\d+ patch/').count(), 1);

    await clickClearButton();
    await devtoolPage.waitForTimeout(1000);

    // After commitAll, patch entries are removed — only the latest state remains as "Initial"
    assert.equal(await devtoolPage.locator('text=/\\d+ patch/').count(), 0,
      'Patch entries should be cleared');
    assert.isAtLeast(await devtoolPage.locator('text=Initial').count(), 1,
      'Initial snapshot should remain');
  });
});
