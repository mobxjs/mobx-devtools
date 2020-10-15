import React from 'react';
import PropTypes from 'prop-types';

export default class Checkbox extends React.PureComponent {
  static propTypes = {
    indeterminate: PropTypes.bool,
  };

  componentDidMount() {
    if (this.props.indeterminate === true) {
      this.setIndeterminate(true);
    }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.indeterminate !== this.props.indeterminate) {
      this.setIndeterminate(this.props.indeterminate);
    }
  }

  setIndeterminate(indeterminate) {
    this.el.indeterminate = indeterminate;
  }

  render() {
    const { indeterminate, ...props } = this.props;
    return (
      <input
        {...props}
        type="checkbox"
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}
