import MobxBackend from './MobxBackend'
import MobxReactBackend from './MobxReactBackend'
import MSTBackend from './MSTBackend'

export default (bridge, hook) => {

  const disposables = [];

  const plugins = [
    new MobxBackend(bridge, hook),
    new MobxReactBackend(bridge, hook),
    new MSTBackend(bridge, hook),
  ];

  plugins.forEach(p => disposables.push(() => p.dispose()));

  Object.keys(hook.collections).forEach(mobxid => {
    plugins.forEach(p => p.setup(mobxid, hook.collections[mobxid]));
  });

  disposables.push(
    bridge.sub('backend:ping', () => bridge.send('frontend:pong')),
    hook.sub('instances-injected', ({ mobxid }) => {
      plugins.forEach(p => p.setup(mobxid, hook.collections[mobxid]));
    })
  );

  return function dispose() {
    disposables.forEach(fn => fn());
  };
};
