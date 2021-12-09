/* eslint-disable no-underscore-dangle */

const setPervStores = stores => {
  if (window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__) {
    window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__.prevStores = stores;
  }
};

const getPrevStores = () => {
  return (
    window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__ &&
    window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__.prevStores
  );
};

export default { setPervStores, getPrevStores };
