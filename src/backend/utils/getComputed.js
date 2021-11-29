import { cloneDeep, isObject, difference, get, set } from 'lodash';
import stringify from 'json-stringify-safe';

// TODO: need to find a better way to loop the stores;

// NOTE: store key is store's constructor.name!!!
const getStoresComputedKeysMap = stores => {
  let storesComputedKeysMap = getComputedKeys();
  if (storesComputedKeysMap) return storesComputedKeysMap;
  const circularRef = [];
  storesComputedKeysMap = {};

  const getChildComputedKeysMap = store => {
    const storeName = getStoreName(store);
    if (storesComputedKeysMap[storeName || '']) return;

    const nonComputedKeys = Object.keys(store);

    if (isMobxStore(store)) {
      const allKeys = Object.getOwnPropertyNames(store);
      storesComputedKeysMap[storeName] = difference(allKeys, nonComputedKeys);
    } else {
      nonComputedKeys.forEach(key => {
        const value = store[key];

        if (typeof value === 'object' && !Array.isArray(value)) {
          // To avoid circular reference cause recursion maximum call
          if (circularRef.includes(value)) return;
          circularRef.push(value);
          getChildComputedKeysMap(value);
        }
      });
    }
  };

  if (isMobxStore(stores)) {
    getChildComputedKeysMap(stores);
  } else if (isObject(stores)) {
    Object.entries(stores).forEach(([storeName, store]) => {
      getChildComputedKeysMap(store);
    });
  }
  setComputedKeys(storesComputedKeysMap);
  return storesComputedKeysMap;
};

const setComputedKeys = storesComputedKeysMap => {
  // eslint-disable-next-line no-underscore-dangle
  const mobxHook = window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__ || {};
  mobxHook.computedKeysMap = storesComputedKeysMap;
};

const getComputedKeys = () => {
  // eslint-disable-next-line no-underscore-dangle
  const mobxHook = window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__;
  const storesComputedKeysMap = mobxHook && mobxHook.computedKeysMap;
  return storesComputedKeysMap;
};

const getStoreName = object => {
  return object.constructor ? object.constructor.name : '';
};

const isMobxStore = object => {
  // eslint-disable-next-line no-underscore-dangle
  const mobxHook = window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__;
  const $mobx = mobxHook && mobxHook.$mobx;
  // eslint-disable-next-line no-underscore-dangle
  return object[$mobx] && !object[$mobx].isPlainObject_;
};

const prefixComputedKey = key => `(Computed) ${key}`;

const mergeComputedIntoStores = (originalStore) => {
  const storesComputedKeysMap = getComputedKeys() || {};
  const targetStore = JSON.parse(stringify(cloneDeep(originalStore)));

  const getChildComputedValue = paths => {
    const store = paths.length ? get(originalStore, paths) : originalStore;

    if (isMobxStore(store)) {
      const StoreKey = getStoreName(store);
      const keys = storesComputedKeysMap[StoreKey] || [];
      keys.forEach(key => {
        const path = [...paths, key];
        try {
          const computedValue = get(originalStore, path);
          set(targetStore, [...paths, prefixComputedKey(key)], computedValue);
        } catch (e) {
          // eslint-disable-next-line no-underscore-dangle
          console.error(`${key} : can't caught computed value`, e);

          set(targetStore, [...paths, prefixComputedKey(key)], `can't caught computed value`);
        }
      });
    } else {
      Object.keys(store).forEach(key => {
        const value = store[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
          getChildComputedValue([...paths, key]);
        }
      });
    }
  };

  if (isMobxStore(originalStore)) {
    getChildComputedValue([]);
  } else if (isObject(originalStore)) {
    Object.entries(targetStore).forEach(([storeName]) => {
      getChildComputedValue([storeName]);
    });
  }

  return targetStore;
};

export default { getStoresComputedKeysMap, mergeComputedIntoStores };
