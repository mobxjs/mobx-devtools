import * as Commands from './Commands';
import * as FrontendCommands from '../../frontend/StoreMST/Commands';

export default class MSTBackend {

  name = 'mst';

  state = {
    mstFound: false,
    snapshotsTrackingEnabled: true,
    actionsTrackingEnabled: true,
    patchesTrackingEnabled: true,
  };

  disposables = [];

  collections = {};

  roots = {};

  constructor(bridge, hook) {
    this.bridge = bridge;
    this.hook = hook;
    this.disposables.push(
      bridge.sub(Commands.REQUST_STATE, () => this.sendState()),
      hook.sub('mst-root', data => this.addRoot(data)),
      hook.sub('mst-root-dispose', data => this.removeRoot(data)),
    );
    window.back = this;
  }

  setup(mobxid, collection) {
    this.collections[mobxid] = collection;
    if (collection.mst) {
      this.state.mstFound = true;
      this.sendState();
      this.hook.emit('get-mst-roots');
    }
  };

  addRoot({root, mobxid}) {
    const { mst } = this.collections[mobxid] || {};
    if (mst) {
      if (!this.roots[mobxid]) { this.roots[mobxid] = []; }
      if (this.roots[mobxid].indexOf(root) !== -1) return;
      this.roots[mobxid].push(root);
      mst.addDisposer(root, () => this.removeRoot({root, mobxid}));
      this.disposables.push(
        mst.onPatch(root, (patch, reversePatch) => {
          if (this.state.patchesTrackingEnabled) {
            this.bridge.send(FrontendCommands.APPEND_PATCHES, { ...patch, reversePatch })
          }
        }),
        mst.onAction(root, (action) => {
          if (this.state.patchesTrackingEnabled) {
            this.bridge.send(FrontendCommands.APPEND_ACTIONS, action)
          }
        }),
        mst.onSnapshot(root, (snapshot) => {
          if (this.state.snapshotsTrackingEnabled) {
            this.bridge.send(FrontendCommands.APPEND_SNAPSHOTS, snapshot)
          }
        }),
      )
    }
  }

  removeRoot({root, mobxid}) {
    if (this.roots[mobxid]) {
      let idx = this.roots[mobxid].indexOf(root);
      if (idx !== -1) this.roots[mobxid].splice(idx, 1);
    }
  }

  sendState() {
    this.bridge.send(FrontendCommands.SET_BACKEND_STATE, this.state)
  };

  dispose() { this.disposables.forEach(fn => fn()); }
}
