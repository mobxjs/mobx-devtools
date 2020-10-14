import React from 'react';
import PropTypes from 'prop-types';

import installGlobalHook from '../../../src/backend/utils/installGlobalHook';
import initBackend from '../../../src/backend';
import Bridge from '../../../src/Bridge';
import createStores from '../../../src/frontend/stores';
import ContextProvider from '../../../src/utils/ContextProvider';
import MiniBar from './MiniBar/index';
import ModalGraph from './ModalGraph';

installGlobalHook(global);

// eslint-disable-next-line no-underscore-dangle
const hook = global.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

// eslint-disable-next-line import/no-unresolved
hook.injectMobxReact(require('mobx-react'), require('mobx'));

const listenersA = [];
const listenersB = [];

const bridgeA = new Bridge({
  listen: (fn) => listenersA.push(fn),
  send: (data) => listenersB.forEach((fn) => fn(data)),
});

const bridgeB = new Bridge({
  listen: (fn) => listenersB.push(fn),
  send: (data) => listenersA.forEach((fn) => fn(data)),
});

bridgeA.serializationOff();
bridgeB.serializationOff();

const disposeBackend = initBackend(bridgeA, hook);

const stores = createStores(bridgeB);

export const configureDevtool = ({
  logEnabled,
  updatesEnabled,
  graphEnabled,
  logFilter,
  highlightTimeout,
}) => {
  if (logEnabled !== undefined) {
    stores.actionsLoggerStore.toggleConsoleLogging(Boolean(logEnabled));
  }
  if (updatesEnabled !== undefined) {
    stores.actionsLoggerStore.toggleShowingUpdates(Boolean(updatesEnabled));
  }
  if (graphEnabled !== undefined) {
    stores.actionsLoggerStore.togglePickingDeptreeComponent(Boolean(graphEnabled));
  }
  if (logFilter !== undefined) {
    stores.actionsLoggerStore.setLogFilter(logFilter);
  }
  if (typeof highlightTimeout === 'number') {
    // eslint-disable-next-line no-console
    console.warn('[mobx-devtools]: configureDevtool({ highlightTimeout }) is deprecated');
  }
};

export default class DevTool extends React.PureComponent {
  static propTypes = {
    noPanel: PropTypes.bool,
    logFilter: PropTypes.func,
    highlightTimeout: PropTypes.number,
    position: PropTypes.object,
  };

  static defaultProps = {
    noPanel: false,
    logFilter: undefined,
    highlightTimeout: undefined,
    position: undefined,
  };

  componentWillMount() {
    const { logFilter, highlightTimeout } = this.props;
    configureDevtool({ logFilter, highlightTimeout });
  }

  componentWillUnmount() {
    disposeBackend();
  }

  render() {
    const { noPanel, position } = this.props;
    return (
      <ContextProvider stores={stores}>
        <div>
          {!noPanel && <MiniBar position={position} />}
          <ModalGraph />
        </div>
      </ContextProvider>
    );
  }
}
