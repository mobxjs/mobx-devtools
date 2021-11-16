import { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ContextProvider extends PureComponent {
  static propTypes = {
    stores: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
  };

  static childContextTypes = {
    stores: PropTypes.object.isRequired,
  };

  getChildContext() {
    // @ts-ignore
    return { stores: this.props.stores };
  }

  render() {
    return this.props.children;
  }
}
