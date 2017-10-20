import installGlobalHook from '../../backend/utils/installGlobalHook';
import initBackend from '../../backend';
import initFrontend from '../../frontend';
import Bridge from '../../Bridge';

installGlobalHook(window);

// eslint-disable-next-line no-underscore-dangle
const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react'), require('mobx'));

const listenersA = [];
const listenersB = [];

const randomDelay = fn => setTimeout(fn, Math.ceil(Math.random() * 30));

const bridgeA = new Bridge({
  listen: fn => listenersA.push(fn),
  send: data => randomDelay(() => listenersB.forEach(fn => fn(data))),
});

initBackend(bridgeA, hook);

const createNode = () => {
  const node = document.createElement('div');
  node.style.position = 'fixed';
  node.style.right = '3px';
  node.style.bottom = '3px';
  node.style.width = '450px';
  node.style.height = '500px';
  node.style.maxHeight = '95vh';
  node.style.backgroundColor = '#fff';
  node.style.overflow = 'hidden';
  node.style.border = '1px solid rgba(0, 0, 0, 0.2)';
  node.style.zIndex = 99999;
  node.style.font = 'initial';
  node.style.color = 'initial';
  node.style.resize = 'both';
  document.body.appendChild(node);

  // Emulate window resize
  new window.MutationObserver(() => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }).observe(node, { attributes: true });

  return node;
};

initFrontend({
  node: createNode(),
  inject: (done) => {
    const wall = {
      listen: fn => listenersB.push(fn),
      send: data => randomDelay(() => listenersA.forEach(fn => fn(data))),
    };
    done(wall, () => {});
  },
  reloadSubscribe: () => () => {},
});
