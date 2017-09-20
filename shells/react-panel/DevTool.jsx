import React, { Component } from 'react';
import PropTypes from 'prop-types';

import installGlobalHook from '../../src/backend/installGlobalHook';
import initBackend from '../../src/backend';
import Bridge from '../../src/Bridge';
import Store from '../../src/frontend/Store';
import ContextProvider from '../../src/frontend/ContextProvider';
import MiniBar from './MiniBar/index';
import Graph from '../../src/frontend/components/Graph/index';

installGlobalHook(window);

// eslint-disable-next-line no-underscore-dangle
const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react'), require('mobx'));


const listenersA = [];
const listenersB = [];

const bridgeA = new Bridge({
    listen: fn => listenersA.push(fn),
    send: data => listenersB.forEach(fn => fn(data)),
})

const bridgeB = new Bridge({
    listen: fn => listenersB.push(fn),
    send: data => listenersA.forEach(fn => fn(data)),
})


const disposeBackend = initBackend(bridgeA)

const store = new Store(bridgeB);

export const configureDevtool = ({
  logEnabled,
  updatesEnabled,
  graphEnabled,
  logFilter,
  highlightTimeout,
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
  //   agent.setHighlightTimeout(highlightTimeout);
  // }
};

export default class DevTool extends Component {

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
      <ContextProvider store={store}>
        <div>
          {!noPanel &&
            <MiniBar position={position} />
          }
          <Graph />
        </div>
      </ContextProvider>
    );
  }
}

