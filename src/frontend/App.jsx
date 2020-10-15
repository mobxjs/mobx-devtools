import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import 'hack-font/build/webfonts/css/hack.css';
import Bridge from '../Bridge';
import createStores from './stores';
import Blocker from './Blocker';
import ContextProvider from '../utils/ContextProvider';
import theme from './theme';

export default class App extends React.PureComponent {
  static propTypes = {
    quiet: PropTypes.bool,
    reloadSubscribe: PropTypes.func.isRequired,
    inject: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    quiet: false,
  };

  state = {
    loaded: false,
    connected: false,
    mobxFound: false,
  };

  componentWillMount() {
    if (this.props.reloadSubscribe) {
      this.$unsubscribeReload = this.props.reloadSubscribe(() => this.reload());
    }
    this.props.inject((wall, teardownWall) => {
      this.$teardownWall = teardownWall;
      const bridge = new Bridge(wall);

      this.$disposables.push(
        bridge.sub('capabilities', ({ mobxFound }) => {
          this.setState({ mobxFound });
        }),
        bridge.sub('content-script-installation-error', () => {
          this.setState({ contentScriptInstallationError: true });
        }),
      );

      bridge.send('backend:ping');
      const connectInterval = setInterval(() => bridge.send('backend:ping'), 500);
      bridge.once('frontend:pong', () => {
        clearInterval(connectInterval);

        this.stores = createStores(bridge);
        if (__DEV__) {
          window.$$frontendStores$$ = this.stores;
        }

        this.setState({ connected: true });
        bridge.send('get-capabilities');
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

  handleContextMenu = e => e.preventDefault();

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
      <div className={css(styles.app, theme.default)} onContextMenu={this.handleContextMenu}>
        {this.renderContent()}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  app: {
    width: '100%',
    height: '100%',
    fontSize: 13,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontWeight: 400,
  },
});
