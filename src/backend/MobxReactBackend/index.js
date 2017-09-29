import BrowserDelegate from './BrowserDelegate';
import deduplicateDependencies from '../../utils/deduplicateDependencies';
import localStorage from '../../utils/localStorage';
import * as Commands from './Commands';
import * as FrontendMobxReactCommands from '../../frontend/StoreMobxReact/Commands';

const LS$UPDATES$KEY = 'mobx-react-devtool$$updatesEnabled';

export default class MobxReactBackend {

  name = 'mobxReact';

  state = {
    mobxReactFound: false,
    updatesEnabled: localStorage.getItem(LS$UPDATES$KEY) === 'YES',
    graphEnabled: false
  };

  disposables = [];

  collections = {};

  constructor(bridge) {
    this.bridge = bridge;

    this.delegate = new BrowserDelegate({
      backendState: this.state,
      getComponentForNode: node => {
        for (let mobxid in this.collections) {
          const { mobxReact } = this.collections[mobxid];
          const component = mobxReact && mobxReact.componentByNodeRegistery.get(node);
          if (component) return { component, mobxid, node };
        }
        return undefined;
      },
      onPickedDeptreeComponent: (component, mobxid) => {
        const { mobx } = this.collections[mobxid];
        const dependencyTree = mobx && mobx.extras.getDependencyTree(
          component.render.$mobx
        );
        if (dependencyTree) deduplicateDependencies(dependencyTree);
        bridge.send(FrontendMobxReactCommands.SET_DEP_TREE, dependencyTree);
        this.state.graphEnabled = false;
        this.sendState();
      }
    });

    this.disposables.push(() => this.delegate.dispose());

    this.disposables.push(
      bridge.sub(Commands.REQUST_STATE, () => this.sendState()),
      bridge.sub(Commands.SET_DISPLAYING_UPDATES_ENABLED, (value) => {
        this.state.updatesEnabled = value;
        this.sendState();
      }),
      bridge.sub(Commands.SET_PICKING_COMPONENT_ENABLED, (value) => {
        this.state.graphEnabled = value;
        if (!value) this.delegate.clearHoveredDeptreeNode();
        this.sendState();
      }),
    );
  }

  // setHighlightTimeout(highlightTimeout) {
  //   this.delegate.highlightTimeout = highlightTimeout;
  // };

  setup(mobxid, collection) {
    this.collections[mobxid] = collection;
    if (collection.mobxReact) {
      collection.mobxReact.trackComponents();
      this.state.mobxReactFound = true;
      this.sendState();
      this.disposables.push(
        collection.mobxReact.renderReporter.on(report => {
          if (this.state.updatesEnabled) {
            this.delegate.displayRenderingReport(report);
          }
        })
      );
    }
  };

  sendState() {
    this.bridge.send(FrontendMobxReactCommands.SET_BACKEND_STATE, this.state)
  };

  dispose() { this.disposables.forEach(fn => fn()); }
}
