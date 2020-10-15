/* global chrome */

let panelCreated = false;
let loadCheckInterval;
function createPanelIfMobxLoaded() {
  if (panelCreated) {
    return;
  }
  chrome.devtools.inspectedWindow.eval(
    '!!(Object.keys(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.collections).length)',
    pageHasMobx => {
      if (!pageHasMobx || panelCreated) {
        return;
      }

      clearInterval(loadCheckInterval);
      panelCreated = true;
      chrome.devtools.panels.create('MobX', '', 'panel.html', () => {});
    },
  );
}

chrome.devtools.network.onNavigated.addListener(createPanelIfMobxLoaded);

loadCheckInterval = setInterval(createPanelIfMobxLoaded, 1000);

createPanelIfMobxLoaded();
