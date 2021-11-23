/* eslint-disable no-undef */
/// <reference path = "../index.d.ts" />

// eslint-disable-next-line import/prefer-default-export
export const injectStores = (rootStore: Stores) => {
  // eslint-disable-next-line no-underscore-dangle
  window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__ = { stores: rootStore };
  return rootStore;
};
