import installGlobalHook from '../../backend/utils/installGlobalHook';

const script = document.createElement('script');
script.textContent = `;(${installGlobalHook.toString()}(window))`;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

// if (__DEV__) {
window.addEventListener('test-open-mobx-devtools-window', () => {
  console.log('test-open-mobx-devtools-window'); // eslint-disable-line no-console
  chrome.extension.sendMessage({ eventName: 'open-mobx-devtools-window' });
});
// }
