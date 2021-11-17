import { cloneDeep } from 'lodash';

export default () => {
  // TODO: investigate how can computed be passed to frontend
  // eslint-disable-next-line no-underscore-dangle
  const storesHook = window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__;
  let newStores = {};
  if (storesHook && storesHook.stores) {
    newStores = cloneDeep(storesHook.stores);
  }
  return JSON.parse(JSON.stringify(newStores));
};
