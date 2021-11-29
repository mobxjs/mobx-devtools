import { cloneDeep } from 'lodash';
import stringify from 'json-stringify-safe';

export default raw => {
  // TODO: investigate how can computed be passed to frontend
  // eslint-disable-next-line no-underscore-dangle
  const storesHook = window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__;
  if (raw) return storesHook ? storesHook.stores : {};
  let newStores = {};
  if (storesHook && storesHook.stores) {
    newStores = cloneDeep(storesHook.stores);
  }
  return JSON.parse(stringify(newStores));
};
