
import * as BackendCommands from '../../backend/MSTBackend/Commands';
import * as Commands from './Commands';

export default class Store {

  state = {
    snapshots: [],
    patches: [],
    actions: [],
  };

  constructor(bridge) {
    this.bridge = bridge;

    this.disposables = [
      bridge.sub(Commands.APPEND_SNAPSHOTS, snapshot => {
        let { snapshots } = this.state;
        if (snapshots.length > 500) {
          snapshots = snapshots.slice(-480);
        }
        this.state.snapshots = snapshots.concat(snapshot);
        this.sendUpdated();
      }),
      bridge.sub(Commands.APPEND_ACTIONS, action => {
        let { actions } = this.state;
        if (actions.length > 500) {
          actions = actions.slice(-480);
        }
        this.state.actions = actions.concat(action);
        this.sendUpdated();
      }),
      bridge.sub(Commands.APPEND_PATCHES, patch => {
        this.state.patches = this.state.patches.filter(a => a !== 'test')
        let { patches } = this.state;
        if (patches.length > 500) {
          patches = patches.slice(-480);
        }
        this.state.patches = patches.concat(patch);
        this.sendUpdated();
      }),
      bridge.sub(Commands.SET_BACKEND_STATE, state => {
        Object.assign(this.state, state);
        this.sendUpdated();
      }),
    ];

    bridge.send(BackendCommands.REQUST_STATE);
  }

  updatedListeners = [];

  sendUpdated = () => {
    console.log(this.state);
    this.updatedListeners.forEach(fn => fn());
  };

  subscibeUpdates = fn => {
    this.updatedListeners.push(fn);
    return () => {
      if (this.updatedListeners.indexOf(fn) !== -1) {
        this.updatedListeners.splice(this.updatedListeners.indexOf(fn), 1);
      }
    };
  };

  toggleSnapshotsTracking(value = !this.state.snapshotsTrackingEnabled) {
    this.bridge.send(BackendCommands.SET_SNAPSHOTS_TRACKING_ENABLED, value);
  }
  togglePatchesTracking(value = !this.state.patchesTrackingEnabled) {
    this.bridge.send(BackendCommands.SET_PATCHES_TRACKING_ENABLED, value);
  }
  toggleActionsTracking(value = !this.state.actionsTrackingEnabled) {
    this.bridge.send(BackendCommands.SET_ACTIONS_TRACKING_ENABLED, value);
  }

  dispose = () => {
    this.disposables.forEach(fn => fn());
    this.disposables.splice(0);
  };
}
