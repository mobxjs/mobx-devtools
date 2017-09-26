import React, { Component } from 'react';
import PropTypes from 'prop-types';

import installGlobalHook from '../../backend/installGlobalHook';
import initBackend from '../../backend';
import Bridge from '../../Bridge';
import Store from '../../frontend/Store';
import ContextProvider from '../../frontend/ContextProvider';
import MiniBar from './MiniBar/index';
import Graph from '../../frontend/components/Graph/index';

installGlobalHook(window);

// eslint-disable-next-line no-underscore-dangle
const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react/index'), require('mobx'));

const listenersA = [];
const listenersB = [];

const bridgeA = new Bridge({
  listen: fn => listenersA.push(fn),
  send: data => listenersB.forEach(fn => fn(data))
});

const bridgeB = new Bridge({
  listen: fn => listenersB.push(fn),
  send: data => listenersA.forEach(fn => fn(data))
});

bridgeA.serializationOff();
bridgeB.serializationOff();

const disposeBackend = initBackend(bridgeA, hook);

const store = new Store(bridgeB);

export const configureDevtool = ({
  logEnabled,
  updatesEnabled,
  graphEnabled,
  logFilter,
  highlightTimeout
}) => {
  if (logEnabled !== undefined) {
    store.toggleConsoleLogging(Boolean(logEnabled));
  }
  if (updatesEnabled !== undefined) {
    store.toggleShowingUpdates(Boolean(updatesEnabled));
  }
  if (graphEnabled !== undefined) {
    store.togglePickingDeptreeComponent(Boolean(graphEnabled));
  }
  if (logFilter !== undefined) {
    store.setLogFilter(logFilter);
  }
  // TODO
  // if (typeof highlightTimeout === 'number') {
  //   store.setHighlightTimeout(highlightTimeout);
  // }
};

export default class DevTool extends Component {
  static propTypes = {
    noPanel: PropTypes.bool,
    logFilter: PropTypes.func,
    highlightTimeout: PropTypes.number,
    position: PropTypes.object
  };

  static defaultProps = {
    noPanel: false,
    logFilter: undefined,
    highlightTimeout: undefined,
    position: undefined
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
      <ContextProvider store={store}>
        <div>
          {!noPanel && <MiniBar position={position} />}
          <Graph />
        </div>
      </ContextProvider>
    );
  }
}
