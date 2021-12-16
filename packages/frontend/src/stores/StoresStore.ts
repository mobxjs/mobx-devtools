import AbstractStore from './AbstractStore';

export type Stores = {
  [storeName: string]: object;
}

export default class StoresStore extends AbstractStore {
  bridge: any = undefined;
  stores: Stores = {};

  noInject = false;

  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('update-stores', (stores: Stores) => {
        this.stores = stores;
        if (!Object.keys(this.stores).length) {
          this.noInject = true;
        } else {
          this.noInject = false;
        }
        this.emit('updateStores')
        this.emit('update-stores')
      }),
    );
  }

  requestStores = () => {
    this.bridge.send('request-stores')
  }
}
