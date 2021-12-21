import { makeAutoObservable } from 'mobx';
import { RootStore } from '.';

export type Stores = {
  [storeName: string]: object;
};

export default class StoresStore {
  rootStore: RootStore;
  stores: Stores = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  get bridge() {
    return this.rootStore.capabilitiesStore.bridge;
  }

  requestStores = () => {
    this.bridge?.send('request-stores');
  };

  subscribe() {
    this.bridge?.sub('update-stores', (stores: Stores) => {
      this.stores = stores;
    });
  }
}
