import { Component } from 'react';
import PropTypes from 'prop-types';

export default class ContextProvider extends Component {
  static propTypes = {
    stores: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
  };

  static childContextTypes = {
    stores: PropTypes.object.isRequired
  };

  getChildContext() {
    return { stores: this.props.stores };
  }

  render() {
    return this.props.children;
  }
}
