
import * as BackendCommands from '../../backend/MobxReactBackend/Commands';
import * as Commands from './Commands';

export default class Store {

  state = {
    dependencyTree: undefined
  };

  constructor(bridge) {
    this.bridge = bridge;

    this.disposables = [
      bridge.sub(Commands.SET_DEP_TREE, dependencyTree => {
        this.state.dependencyTree = dependencyTree;
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

  toggleShowingUpdates(value = !this.state.updatesEnabled) {
    this.bridge.send(BackendCommands.SET_DISPLAYING_UPDATES_ENABLED, value);
  }

  togglePickingDeptreeComponent(value = !this.state.graphEnabled) {
    this.bridge.send(BackendCommands.SET_PICKING_COMPONENT_ENABLED, value);
  }

  clearDeptree() {
    this.state.dependencyTree = undefined;
    this.sendUpdated();
  }

  dispose = () => {
    this.disposables.forEach(fn => fn());
    this.disposables.splice(0);
  };
}
