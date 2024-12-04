let panelCreated = false;
let loadCheckInterval;
function createPanelIfMobxLoaded() {
  if (panelCreated) {
    return;
  }

  chrome.scripting
    .executeScript({
      target: { tabId: chrome.devtools.inspectedWindow.tabId },
      func: () => {
        const pageHasMobx = !!Object.keys(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__?.collections || {})
          .length;
        return pageHasMobx;
      },
      world: 'MAIN',
    })
    .then(([result]) => {
      const pageHasMobx = result?.result;

      if (!pageHasMobx || panelCreated) {
        return;
      }

      clearInterval(loadCheckInterval);
      panelCreated = true;
      chrome.devtools.panels.create('MobX', '', 'panel.html', panel => {});
    })
    .catch(err => {
      console.error('Failed to check MobX:', err);
    });
}

chrome.devtools.network.onNavigated.addListener(createPanelIfMobxLoaded);

loadCheckInterval = setInterval(createPanelIfMobxLoaded, 1000);

createPanelIfMobxLoaded();
