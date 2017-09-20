import deduplicateDependencies from './utils/deduplicateDependencies';
import BrowserAgentDelegate from './BrowserAgentDelegate';
import ChangesProcessor from './utils/ChangesProcessor';
import localStorage from './utils/localStorage';

const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

const LS$UPDATES$KEY = 'mobx-react-devtool$$updatesEnabled';
const LS$CONSOLE$LOG$KEY = 'mobx-react-devtool$$clogEnabled';
const LS$PANEL$LOG$KEY = 'mobx-react-devtool$$pLogEnabled';

export default bridge => {
  const disposables = [];
  const connectionDisposables = [];

  const state = {
    mobxFound: false,
    mobxReactFound: false,
    updatesEnabled: localStorage.getItem(LS$UPDATES$KEY) === 'YES',
    logEnabled: localStorage.getItem(LS$PANEL$LOG$KEY) === 'YES',
    consoleLogEnabled: localStorage.getItem(LS$CONSOLE$LOG$KEY) === 'YES',
    logFilter: undefined,
    graphEnabled: false
  };

  const changesProcessor = new ChangesProcessor(change => {
    if (state.logFilter) {
      try {
        const accept = state.logFilter(change);
        if (!accept) return;
      } catch (e) {
        console.warn('Error while evaluating logFilter:', e); // eslint-disable-line no-console
      }
    }
    if (state.logEnabled) {
      if (change) {
        bridge.send('frontent:append-log', change);
      }
    }
    if (state.consoleLogEnabled) {
      delegate.consoleLogChange(change);
    }
  });

  const delegate = new BrowserAgentDelegate({
    backendState: state,
    hook,
    onPickedDeptreeComponent: (component, mobxid) => {
      const dependencyTree = hook.instances[mobxid].mobx.extras.getDependencyTree(
        component.render.$mobx
      );
      deduplicateDependencies(dependencyTree);
      bridge.send('frontent:set-deptree', dependencyTree);
      state.graphEnabled = false;
      sendState();
    }
  });

  const sendState = () => bridge.send('frontend:backend-state', state);

  const setupMobx = mobx => {
    state.mobxFound = true;
    disposables.push(
      mobx.spy(change => {
        if (state.logEnabled || state.consoleLogEnabled) {
          changesProcessor.push(change, mobx);
        }
      })
    );
    sendState();
  };

  const setupMobxReact = mobxReact => {
    state.mobxReactFound = true;
    disposables.push(
      mobxReact.renderReporter.on(report => {
        if (state.updatesEnabled) {
          delegate.displayRenderingReport(report);
        }
      })
    );
    sendState();
  };

  const setHighlightTimeout = highlightTimeout => {
    delegate.highlightTimeout = highlightTimeout;
  };

  disposables.push(() => delegate.dispose());

  disposables.push(
    hook.sub('mobx', ({ mobxid, mobx }) => {
      setupMobx(mobx, mobxid);
    })
  );

  disposables.push(
    hook.sub('mobx-react', ({ mobxrid, mobxReact }) => {
      setupMobxReact(mobxReact, mobxrid);
    })
  );

  Object.keys(hook.instances).forEach(mobxid => {
    const mobx = hook.instances[mobxid].mobx;
    const mobxReact = hook.instances[mobxid].mobxReact;
    setupMobx(mobx, mobxid);
    if (mobxReact) setupMobxReact(mobxReact, mobxid);
  });

  connectionDisposables.push(
    bridge.sub('backend:request-state', () => {
      sendState();
    })
  );

  connectionDisposables.push(
    bridge.sub('backend:set-state-value', ({ key, value }) => {
      state[key] = value;
      sendState();

      switch (key) {
        case 'graphEnabled':
          if (!value) delegate.clearHoveredDeptreeNode();
          break;
        case 'logEnabled':
        case 'consoleLogEnabled':
          if (!state.logEnabled && !state.consoleLogEnabled) changesProcessor.flush();
          break;
      }
    })
  );

  sendState();

  window.$$sendState = sendState;

  return function dispose() {
    disposables.forEach(fn => fn());
    connectionDisposables.forEach(fn => fn());
  };
};
