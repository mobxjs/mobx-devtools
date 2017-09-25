import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bridge from '../Bridge';
import Store from './Store';
import Blocked from './components/Blocked';
import ContextProvider from './ContextProvider';

export default class Loader extends Component {
  static propTypes = {
    quiet: PropTypes.bool,
    debugName: PropTypes.string,
    reload: PropTypes.func.isRequired,
    reloadSubscribe: PropTypes.func.isRequired,
    inject: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    quiet: false,
    debugName: ''
  };

  state = {
    loaded: false,
    connected: false,
    mobxFound: false
  };

  componentWillMount() {
    if (this.props.reloadSubscribe) {
      this.$unsubscribeReload = this.props.reloadSubscribe(() => this.reload());
    }
    this.props.inject((wall, teardownWall) => {
      this.$teardownWall = teardownWall;
      const bridge = new Bridge(wall);
      const store = new Store(bridge, `${this.props.debugName} store`);

      if (!window.stores) {
        window.stores = [];
      }
      if (!window.stores.includes(store)) window.stores.push(store);

      this.$disposables.push(
        store.subscibeUpdates(() => {
          this.setState({
            connected: true,
            mobxFound: store.state.mobxFound,
            contentScriptInstallationError: store.state.contentScriptInstallationError
          });
        })
      );

      // Request state until getting response
      const connectInterval = setInterval(() => bridge.send('backend:request-state'), 500);
      bridge.once('frontend:backend-state', () => clearInterval(connectInterval));
      bridge.send('backend:request-state');

      if (!this.$unMounted) {
        this.setState({ loaded: true, store });
      }
    });
  }

  componentWillUnmount() {
    this.$unMounted = true;
    this.reload();
  }

  $unMounted = false;
  $disposables = [];

  reload() {
    if (!this.$unMounted) this.setState({ loaded: false, store: undefined }, this.props.reload);
    this.teardown();
  }

  teardown() {
    if (this.$unsubscribeReload) {
      this.$unsubscribeReload();
      this.$unsubscribeReload = undefined;
    }
    if (this.$teardownWall) {
      this.$teardownWall();
      this.$teardownWall = undefined;
    }
  }

  renderContent() {
    if (this.state.contentScriptInstallationError) {
      return <Blocked>Error while installing content-script</Blocked>;
    }
    if (!this.state.loaded) {
      return !this.props.quiet && <Blocked>Loading...</Blocked>;
    }
    if (!this.state.connected) {
      return !this.props.quiet && <Blocked>Connecting...</Blocked>;
    }
    if (this.state.mobxFound !== true) {
      return !this.props.quiet && <Blocked>Looking for mobx...</Blocked>;
    }
    return (
      <ContextProvider store={this.state.store}>
        {React.Children.only(this.props.children)}
      </ContextProvider>
    );
  }

  render() {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        {this.renderContent()}
        {__DEV__ && (
          <div style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 2 }}>
            <button onClick={() => this.reload()}>Reload</button>
            <button onClick={() => this.$teardownWall()}>Disconnect</button>
            <button onClick={() => this.state.store.bridge.send('backend:test-event')}>
              Test event
            </button>
          </div>
        )}
      </div>
    );
  }
}
