
import * as BackendMobxCommands from '../../backend/MobxBackend/Commands';
import * as Commands from './Commands';

export default class Store {

  state = {
    log: [],
  };

  constructor(bridge) {
    this.bridge = bridge;

    this.disposables = [
      bridge.sub(Commands.APPEND_LOG, changes => {
        let log = this.state.log;
        if (log.length > 500) {
          log = log.slice(-480);
        }
        this.state.log = log.concat(changes);
        this.sendUpdated();
      }),
      bridge.sub(Commands.SET_BACKEND_STATE, state => {
        Object.assign(this.state, state);
        this.sendUpdated();
      }),
    ];

    bridge.send(BackendMobxCommands.REQUST_STATE);
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

  toggleLogging(value = !this.state.logEnabled) {
    this.bridge.send(BackendMobxCommands.SET_LOG_ENABLED, value);
  }

  toggleConsoleLogging(value = !this.state.consoleLogEnabled) {
    this.bridge.send(BackendMobxCommands.SET_CONSOLE_LOG_ENABLED, value);
  }

  clearLog() {
    this.state.log = [];
    this.sendUpdated();
  }

  setLogFilter(logFilter) {
    this.state.logFilter = logFilter;
    this.sendUpdated();
  }

  dispose = () => {
    this.disposables.forEach(fn => fn());
    this.disposables.splice(0);
  };
}
