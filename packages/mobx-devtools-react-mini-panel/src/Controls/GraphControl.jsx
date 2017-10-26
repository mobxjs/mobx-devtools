import React from 'react';
import PropTypes from 'prop-types';

export default class GraphControl extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  componentWillMount() {
    this.setState({});
  }

  componentDidMount() {
    // eslint-disable-next-line no-underscore-dangle
    const { store } = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.agent;
    this.$unsubscribe = store.subscribeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  render() {
    // eslint-disable-next-line no-underscore-dangle
    const { store } = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.agent;
    const { children } = this.props;
    return React.cloneElement(children, {
      onToggle: () => store.togglePickingDeptreeComponent(),
      active: store.state.graphEnabled,
    });
  }
}
