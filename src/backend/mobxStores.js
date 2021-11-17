import getStoresFromHook from './utils/getStoresFromHook';

export default bridge => {
  const disposables = [
    bridge.sub('request-stores', () => {
      const stores = getStoresFromHook();
      bridge.send('update-stores', stores);
    }),
  ];

  return {
    setup(mobxid, collection) {},
    dispose() {
      disposables.forEach(fn => fn());
    },
  };
};
