import React, { Component } from 'react';
import PropTypes from 'prop-types';

import installGlobalHook from '../../backend/installGlobalHook';
import initBackend from '../../backend';
import Bridge from '../../Bridge';
import StoreMobx from '../../frontend/StoreMobx';
import StoreMobxReact from '../../frontend/StoreMobxReact';
import StoreMST from '../../frontend/StoreMST';
import ContextProvider from '../../utils/ContextProvider';
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

const stores = {
  storeMobx: new StoreMobx(bridgeB),
  storeMobxReact: new StoreMobxReact(bridgeB),
  storeMST: new StoreMST(bridgeB),
};

export const configureDevtool = ({
  logEnabled,
  updatesEnabled,
  graphEnabled,
  logFilter,
  highlightTimeout
}) => {
  if (logEnabled !== undefined) {
    stores.storeMobx.toggleConsoleLogging(Boolean(logEnabled));
  }
  if (updatesEnabled !== undefined) {
    stores.storeMobx.toggleShowingUpdates(Boolean(updatesEnabled));
  }
  if (graphEnabled !== undefined) {
    stores.storeMobx.togglePickingDeptreeComponent(Boolean(graphEnabled));
  }
  if (logFilter !== undefined) {
    stores.storeMobx.setLogFilter(logFilter);
  }
  if (typeof highlightTimeout === 'number') {
    console.warn('[mobx-devtools]: configureDevtool({ highlightTimeout }) is deprecated');
  }
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
      <ContextProvider stores={stores}>
        <div>
          {!noPanel && <MiniBar position={position} />}
          <Graph />
        </div>
      </ContextProvider>
    );
  }
}
