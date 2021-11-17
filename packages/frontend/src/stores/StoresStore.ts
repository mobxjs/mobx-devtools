import AbstractStore from './AbstractStore';

export type Stores = {
  [storeName: string]: object;
}

export default class StoresStore extends AbstractStore {
  bridge: any = undefined;
  stores: Stores = {};

  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('update-stores', (stores: Stores) => {
        this.stores = stores;
        this.emit('updateStores')
      }),
    );
  }
}
