import getStoresFromHook from './utils/getStoresFromHook';
import getComputed from './utils/getComputed';
import diff from './utils/diff';


export default bridge => {
  const disposables = [
    bridge.sub('request-stores', () => {
      const stores = getStoresFromHook(true);
      getComputed.getStoresComputedKeysMap(stores);
      const newStores = getComputed.mergeComputedIntoStores(stores);
      diff.setPervStores(newStores);
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
