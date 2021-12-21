import { makeAutoObservable } from 'mobx';
import { RootStore } from '.';

export type Stores = {
  [storeName: string]: object;
};

export default class StoresStore {
  rootStore: RootStore;
  stores: Stores = {};

  noInject = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  get bridge() {
    return this.rootStore.capabilitiesStore.bridge;
  }

  subscribe() {
    this.bridge?.sub('update-stores', (stores: Stores) => {
      this.stores = stores;
      if (!Object.keys(this.stores).length) {
        this.noInject = true;
      } else {
        this.noInject = false;
      }
    });
  }

  requestStores = () => {
    this.bridge?.send('request-stores');
  };
}
