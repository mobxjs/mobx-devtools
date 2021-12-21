import { makeAutoObservable } from 'mobx';
import Bridge from 'src/Bridge';
import { RootStore } from '.';

export default class CapabilitiesStore {
  rootStore: RootStore;

  bridge?: Bridge = undefined;
  capabilities: any = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  setBridge(bridge: Bridge) {
    this.bridge = bridge;

    this.subscribe();
    this.rootStore.storesStore.subscribe();
    this.rootStore.actionsLoggerStore.subscribe();
  }

  subscribe() {
    this.bridge?.send('get-capabilities');

    this.bridge?.sub('capabilities', capabilities => {
      this.capabilities = capabilities;
      Object.keys(capabilities).forEach(key => {
        if (this[key] !== capabilities[key]) {
          this[key] = capabilities[key];
        }
      });
    });
  }
}
