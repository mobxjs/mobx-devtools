import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bridge from '../Bridge';
import StoreMobx from './StoreMobx';
import StoreMobxReact from './StoreMobxReact';
import Blocker from './components/Blocker/index';
import ContextProvider from '../utils/ContextProvider';

export default class App extends Component {
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

      this.stores = {
        storeMobx: new StoreMobx(bridge),
        storeMobxReact: new StoreMobxReact(bridge),
      };

      this.$disposables.push(
        this.stores.storeMobx.subscibeUpdates(() => {
          this.setState({ mobxFound: this.stores.storeMobx.state.mobxFound });
        }),
        bridge.sub('content-script-installation-error', () => {
          this.setState({ contentScriptInstallationError: true });
        })
      );

      bridge.send('backend:ping');
      const connectInterval = setInterval(() => bridge.send('backend:ping'), 500);
      bridge.once('frontend:pong', () => {
        clearInterval(connectInterval);
        this.setState({ connected: true });
      });

      if (!this.$unMounted) {
        this.setState({ loaded: true });
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
      return <Blocker>Error while installing content-script</Blocker>;
    }
    if (!this.state.loaded) {
      return !this.props.quiet && <Blocker>Loading...</Blocker>;
    }
    if (!this.state.connected) {
      return !this.props.quiet && <Blocker>Connecting...</Blocker>;
    }
    if (this.state.mobxFound !== true) {
      return !this.props.quiet && <Blocker>Looking for mobx...</Blocker>;
    }
    return (
      <ContextProvider stores={this.stores}>
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
            <button onClick={() => this.stores.storeMobx.bridge.send('backend:test-event')}>
              Test event
            </button>
          </div>
        )}
      </div>
    );
  }
}
