export default class Store {
  constructor(bridge, debugName) {
    this.debugName = debugName;
    this.bridge = bridge;

    this.disposables = [
      bridge.sub('frontent:append-log', changes => {
        let log = this.state.log;
        if (log.length > 500) {
          log = log.slice(-480);
        }
        this.state.log = log.concat(changes);
        this.scheduleUpdate();
      }),
      bridge.sub('frontent:set-deptree', dependencyTree => {
        this.$setStateKey('dependencyTree', dependencyTree);
      }),
      bridge.sub('frontend:backend-state', state => {
        Object.assign(this.state, state);
        this.scheduleUpdate();
      }),
      bridge.sub('content-script-installation-error', () => {
        this.state.contentScriptInstallationError = true;
        this.scheduleUpdate();
      })
    ];
  }

  state = {
    log: [],
    dependencyTree: undefined
  };

  updatedListeners = [];

  $setStateKey(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.scheduleUpdate();
    }
  }

  $sendAction(action, value) {
    this.bridge.send('event', { action, value });
  }

  scheduleUpdate() {
    clearTimeout(this.updt);
    this.updt = setTimeout(this.$sendUpdated, 15);
  }

  $sendUpdated = () => {
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
    this.bridge.send('backend:set-state-value', { key: 'updatesEnabled', value });
  }

  togglePickingDeptreeComponent(value = !this.state.graphEnabled) {
    this.bridge.send('backend:set-state-value', { key: 'graphEnabled', value });
  }

  toggleLogging(value = !this.state.logEnabled) {
    this.bridge.send('backend:set-state-value', { key: 'logEnabled', value });
  }

  toggleConsoleLogging(value = !this.state.consoleLogEnabled) {
    this.bridge.send('backend:set-state-value', { key: 'consoleLogEnabled', value });
  }

  appendLog(data) {}

  clearLog() {
    this.$setStateKey('log', []);
  }

  setDeptree(deptree) {
    this.$setStateKey('dependencyTree', deptree);
  }

  clearDeptree() {
    this.$setStateKey('dependencyTree', undefined);
  }

  setLogFilter(logFilter) {
    this.$setStateKey('logFilter', logFilter);
  }

  dispose = () => {
    this.disposables.forEach(fn => fn());
    this.disposables.splice(0);
  };
}
