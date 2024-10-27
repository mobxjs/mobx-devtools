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
        console.log('Executing script in tab:');
        console.log(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__);
        console.log(window.location.href);
        const pageHasMobx = !!Object.keys(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__?.collections || {})
          .length;
        console.log('Page has MobX:', pageHasMobx);
        return pageHasMobx;
      },
      world: 'MAIN',
    })
    .then(([result]) => {
      console.log('MobX check result:', result); // Debug log
      const pageHasMobx = result?.result; // Access the result property
      console.log('Page has MobX:', pageHasMobx); // Debug log

      if (!pageHasMobx || panelCreated) {
        return;
      }

      clearInterval(loadCheckInterval);
      panelCreated = true;
      chrome.devtools.panels.create('MobX', '', 'panel.html', panel => {
        console.log('Panel created:', panel); // Debug log
      });
    })
    .catch(err => {
      console.error('Failed to check MobX:', err);
    });
}

chrome.devtools.network.onNavigated.addListener(createPanelIfMobxLoaded);

loadCheckInterval = setInterval(createPanelIfMobxLoaded, 1000);

createPanelIfMobxLoaded();
