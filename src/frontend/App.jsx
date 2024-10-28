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

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      connected: false,
      mobxFound: false,
    };
  }

  componentWillMount() {
    console.log('App.jsx componentWillMount');
    if (this.props.reloadSubscribe) {
      console.log('App.jsx componentWillMount subscribing to reload');
      this.$unsubscribeReload = this.props.reloadSubscribe(() => this.reload());
    }
    this.props.inject((wall, teardownWall) => {
      console.log('App.jsx componentWillMount injecting');
      this.$teardownWall = teardownWall;
      const bridge = new Bridge(wall);

      this.$disposables.push(
        bridge.sub('capabilities', ({ mobxFound }) => {
          console.log('App.jsx componentWillMount subscribing to capabilities');
          this.setState({ mobxFound });
        }),
        bridge.sub('content-script-installation-error', () => {
          console.log(
            'App.jsx componentWillMount subscribing to content-script-installation-error',
          );
          this.setState({ contentScriptInstallationError: true });
        }),
      );

      console.log('App.jsx componentWillMount sending backend:ping');
      bridge.send('backend:ping');
      const connectInterval = setInterval(() => bridge.send('backend:ping'), 500);
      bridge.once('frontend:pong', () => {
        console.log('App.jsx componentWillMount received frontend:pong');
        clearInterval(connectInterval);

        this.stores = createStores(bridge);
        console.log('App.jsx componentWillMount created stores');
        if (__DEV__) {
          console.log('App.jsx componentWillMount setting $$frontendStores$$');
          window.$$frontendStores$$ = this.stores;
        }

        this.setState({ connected: true });
        console.log('App.jsx componentWillMount sending get-capabilities');
        bridge.send('get-capabilities');
      });

      if (!this.$unMounted) {
        console.log('App.jsx componentWillMount setting loaded to true');
        this.setState({ loaded: true });
      }
    });
  }

  componentWillUnmount() {
    console.log('App.jsx componentWillUnmount setting unmounted to true');
    this.$unMounted = true;
    this.reload();
  }

  $unMounted = false;

  $disposables = [];

  reload() {
    console.log('App.jsx reload');
    if (!this.$unMounted) this.setState({ loaded: false }, this.props.reload);
    this.teardown();
  }

  teardown() {
    console.log('App.jsx teardown');
    if (this.$unsubscribeReload) {
      console.log('App.jsx teardown unsubscribing from reload');
      this.$unsubscribeReload();
      this.$unsubscribeReload = undefined;
    }
    if (this.$teardownWall) {
      console.log('App.jsx teardown calling teardownWall');
      this.$teardownWall();
      this.$teardownWall = undefined;
    }
  }

  handleContextMenu = e => e.preventDefault();

  renderContent() {
    console.log('App.jsx renderContent');
    if (this.state.contentScriptInstallationError) {
      console.log('App.jsx renderContent returning Blocker for contentScriptInstallationError');
      return <Blocker>Error while installing content-script</Blocker>;
    }
    if (!this.state.loaded) {
      console.log('App.jsx renderContent returning Blocker for loading');
      return !this.props.quiet && <Blocker>Loading...</Blocker>;
    }
    if (!this.state.connected) {
      console.log('App.jsx renderContent returning Blocker for connecting');
      return !this.props.quiet && <Blocker>Connecting...</Blocker>;
    }
    if (this.state.mobxFound !== true) {
      console.log('App.jsx renderContent returning Blocker for looking for mobx');
      return !this.props.quiet && <Blocker>Looking for mobx...</Blocker>;
    }
    console.log('App.jsx renderContent returning ContextProvider');
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
