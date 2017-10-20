import installGlobalHook from '../../backend/utils/installGlobalHook';

const script = document.createElement('script');
script.textContent = `;(${installGlobalHook.toString()}(window))`;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
