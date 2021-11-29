import getStoresFromHook from './utils/getStoresFromHook';
import getComputed from './utils/getComputed';

export default bridge => {
  const disposables = [
    bridge.sub('request-stores', () => {
      const stores = getStoresFromHook(true);
      getComputed.getStoresComputedKeysMap(stores);
      const newStores = getComputed.mergeComputedIntoStores(stores);

      bridge.send('update-stores', newStores);
    }),
  ];

  return {
    setup(mobxid, collection) {},
    dispose() {
      disposables.forEach(fn => fn());
    },
  };
};
