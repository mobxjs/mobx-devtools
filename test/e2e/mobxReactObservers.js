const { assert } = require('chai');
const prepare = require('../prepare');
const { startDevServer } = require('../../packages/playground/webpack.makeConfig');

describe('Changes tab', function test() {
  let mainPage;
  let devtoolPage;
  let teardown;
  let closePlayground;
  this.timeout(100000);

  before(async () => {
    closePlayground = await startDevServer({ port: 8082, pages: ['baltimore'] });
    const result = await prepare({ initialUrl: 'http://localhost:8082/baltimore.html' });
    mainPage = result.mainWindowHandle;
    devtoolPage = result.devtoolWindowHandle;
    teardown = result.teardown;
  });

  after(async () => {
    if (closePlayground) closePlayground();
    if (teardown) await teardown();
  });

  const startRecording = async () => {
    await devtoolPage.locator('[data-hook="ButtonRecord"]').click();
  };

  const clickClearButton = async () => {
    await devtoolPage.locator('[data-hook="ButtonClear"]').click();
  };

  it('should record and display MobX changes', async () => {
    // Initially shows a tip to start recording
    const tip = devtoolPage.locator('text=Click to start recording');
    await tip.waitFor({ timeout: 5000 });
    assert.isTrue(await tip.isVisible());

    // Start recording
    await startRecording();
    await devtoolPage.waitForTimeout(500);
    assert.isFalse(await tip.isVisible(), 'Tip should disappear after starting recording');

    // Perform actions on the main page
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '–' }).click();
    await devtoolPage.waitForTimeout(2000);

    // Verify log entries appeared
    assert.isAtLeast(
      await devtoolPage.locator('text=manuallyIncrease').count(),
      1,
      'Expected manuallyIncrease log entries',
    );
    assert.isAtLeast(
      await devtoolPage.locator('text=manuallyDecrease').count(),
      1,
      'Expected manuallyDecrease log entries',
    );
  });

  it('should open object popover', async () => {
    // Expand a log item by clicking on it
    await devtoolPage.locator('text=manuallyIncrease').first().click();

    // Click the {…} object trigger to open the popover
    const trigger = devtoolPage.locator('[data-hook="ChangeDataViewerPopover"]').first();
    await trigger.waitFor();
    await trigger.click();

    // The popover should show a DataViewer with object properties
    const popover = devtoolPage.locator('[data-hook="Popover"]');
    await popover.waitFor();
    assert.isTrue(await popover.isVisible(), 'Popover should be visible');
    assert.isAtLeast((await popover.textContent()).length, 1, 'Popover should have content');

    // Close the popover by clicking outside
    await devtoolPage.locator('[data-hook="ButtonRecord"]').click();
    // Re-enable recording for subsequent tests
    await devtoolPage.locator('[data-hook="ButtonRecord"]').click();
  });

  it('should filter log entries by text and regex search', async () => {
    const searchInput = devtoolPage.locator('input[placeholder="Search (string/regex)"]');

    // Text filter
    await searchInput.fill('manuallyIncrease');
    await devtoolPage.waitForTimeout(1000);
    assert.isAtLeast(await devtoolPage.locator('text=manuallyIncrease').count(), 1);
    assert.equal(
      await devtoolPage.locator('text=manuallyDecrease').count(),
      0,
      'manuallyDecrease should be filtered out',
    );

    // Regex filter
    await searchInput.fill('/manually[Dd]ecrease');
    await devtoolPage.waitForTimeout(1000);
    assert.isAtLeast(await devtoolPage.locator('text=manuallyDecrease').count(), 1);
    assert.equal(
      await devtoolPage.locator('text=manuallyIncrease').count(),
      0,
      'manuallyIncrease should not match regex',
    );

    await searchInput.fill('');
    await devtoolPage.waitForTimeout(500);
  });

  it('should clear log and stop recording', async () => {
    // Clear log
    assert.isAtLeast(await devtoolPage.locator('text=manuallyIncrease').count(), 1);
    await clickClearButton();
    await devtoolPage.waitForTimeout(1000);
    assert.equal(
      await devtoolPage.locator('text=manuallyIncrease').count(),
      0,
      'Log should be empty after clear',
    );
    assert.equal(
      await devtoolPage.locator('text=manuallyDecrease').count(),
      0,
      'Log should be empty after clear',
    );

    // Verify recording still works after clear
    await mainPage.locator('button', { hasText: '+' }).click();
    await devtoolPage.waitForTimeout(2000);
    assert.isAtLeast(
      await devtoolPage.locator('text=manuallyIncrease').count(),
      1,
      'New changes should appear after clearing',
    );

    // Stop recording
    await startRecording();
    await clickClearButton();
    await devtoolPage.waitForTimeout(500);
    await mainPage.locator('button', { hasText: '+' }).click();
    await mainPage.locator('button', { hasText: '+' }).click();
    await devtoolPage.waitForTimeout(2000);
    assert.equal(
      await devtoolPage.locator('text=manuallyIncrease').count(),
      0,
      'No changes should be recorded when stopped',
    );
  });
});
