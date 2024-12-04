// Simply importing this file will install the global hook here
import installGlobalHook from '../../backend/utils/installGlobalHook';

if (__DEV__) {
  window.addEventListener('test-open-mobx-devtools-window', () => {
    console.log('test-open-mobx-devtools-window'); // eslint-disable-line no-console
    chrome.runtime.sendMessage({ eventName: 'open-mobx-devtools-window' });
  });
}

installGlobalHook(window);
