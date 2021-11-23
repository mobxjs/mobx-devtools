declare type Stores = {
  [storeName: string]: Object;
};

declare type StoresHook = {
  stores: Stores;
};
declare interface Window {
  __MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__: StoresHook;
}
