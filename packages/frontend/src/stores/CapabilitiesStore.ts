import AbstractStore from './AbstractStore';

export default class CapabilitiesStore extends AbstractStore {
  bridge: any;
  capabilities: any;
  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('capabilities', capabilities => {
        this.capabilities = capabilities;
        Object.keys(capabilities).forEach(key => {
          if (this[key] !== capabilities[key]) {
            this[key] = capabilities[key];
            this.emit(key);
          }
        });
      }),
    );

    bridge.send('get-capabilities');
  }
}
