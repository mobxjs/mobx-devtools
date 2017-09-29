import localStorage from '../../utils/localStorage';
import ChangesProcessor from '../../utils/ChangesProcessor';
import consoleLogChange from './consoleLogChange';
import * as Commands from './Commands';
import * as FrontendMobxCommands from '../../frontend/StoreMobx/Commands';

const LS$CONSOLE$LOG$KEY = 'mobx-react-devtool$$clogEnabled';
const LS$PANEL$LOG$KEY = 'mobx-react-devtool$$pLogEnabled';

export default class MobxBackend {

  name = 'mobx';

  state = {
    mobxFound: false,
    logEnabled: localStorage.getItem(LS$PANEL$LOG$KEY) === 'YES',
    consoleLogEnabled: localStorage.getItem(LS$CONSOLE$LOG$KEY) === 'YES',
    logFilter: undefined,
  };

  disposables = [];

  collections = {};

  constructor(bridge) {
    this.bridge = bridge;


    this.changesProcessor = new ChangesProcessor(change => {
      if (this.state.logFilter) {
        try {
          const accept = this.state.logFilter(change);
          if (!accept) return;
        } catch (e) {
          console.warn('Error while evaluating logFilter:', e); // eslint-disable-line no-console
        }
      }
      if (this.state.logEnabled) {
        if (change) {
          bridge.send(FrontendMobxCommands.APPEND_LOG, change);
        }
      }
      if (this.state.consoleLogEnabled) {
        consoleLogChange(change);
      }
    });


    this.disposables.push(
      bridge.sub(Commands.REQUST_STATE, () => this.sendState()),
      bridge.sub(Commands.SET_LOG_ENABLED, (value) => {
        this.state.logEnabled = value;
        this.sendState();
        if (!this.state.logEnabled && !this.state.consoleLogEnabled) this.changesProcessor.flush();
      }),
      bridge.sub(Commands.SET_CONSOLE_LOG_ENABLED, (value) => {
        this.state.consoleLogEnabled = value;
        this.sendState();
        if (!this.state.logEnabled && !this.state.consoleLogEnabled) this.changesProcessor.flush();
      }),
    );

    this.sendState();
  }

  setup(mobxid, collection) {
    if (collection.mobx) {
      this.state.mobxFound = true;
      this.disposables.push(
        collection.mobx.spy(change => {
          if (this.state.logEnabled || this.state.consoleLogEnabled) {
            this.changesProcessor.push(change, collection.mobx);
          }
        })
      );
      this.sendState();
    }
  };

  sendState() {
    this.bridge.send(FrontendMobxCommands.SET_BACKEND_STATE, this.state)
  };

  dispose() { this.disposables.forEach(fn => fn()); }
}
