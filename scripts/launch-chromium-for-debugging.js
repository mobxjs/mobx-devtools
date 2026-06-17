/**
 * Launches Chromium with the MobX DevTools extension and the playground app.
 *
 * Usage:
 *   node scripts/launch-chromium-for-debugging.js [--skip-build]
 *
 * The script:
 *  1. Builds the Chrome extension into lib/chrome (unless --skip-build is passed).
 *  2. Starts the playground dev server on http://localhost:8082.
 *  3. Opens Chromium with the extension loaded and DevTools auto-opened.
 *
 * Press Ctrl+C to stop.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const { chromium } = require('playwright');
const { startDevServer } = require('../packages/playground/webpack.makeConfig');

const rootDir = path.join(__dirname, '..');
const extensionPath = path.join(rootDir, 'lib/chrome');
const skipBuild = process.argv.includes('--skip-build');

(async () => {
  // 1. Build extension
  if (!skipBuild) {
    console.log('Building Chrome extension...');
    execSync('node scripts/webextension/build.js', {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', TARGET_BROWSER: 'chrome' },
    });
  }

  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension not found at ${extensionPath}. Run the build first.`);
    process.exit(1);
  }

  // 2. Start playground dev server (all pages so the root index works)
  console.log('Starting playground dev server...');
  const closePlayground = await startDevServer({});

  // 3. Launch browser
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobx-devtools-debug-'));
  console.log(`Temp profile: ${userDataDir}`);

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--auto-open-devtools-for-tabs',
    ],
  });

  const mainPage = context.pages()[0] || (await context.newPage());
  await mainPage.goto('http://localhost:8082');
  console.log(
    'Opened http://localhost:8082 — pick a playground page, then switch to the MobX tab in DevTools.',
  );

  // Keep alive until the browser is closed or Ctrl+C
  context.on('close', () => {
    closePlayground();
    fs.rmSync(userDataDir, { recursive: true, force: true });
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await context.close();
  });
})();
