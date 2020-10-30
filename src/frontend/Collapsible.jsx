import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';

export default class Collapsible extends React.PureComponent {
  static propTypes = {
    head: PropTypes.node,
    children: PropTypes.node,
    startOpen: PropTypes.bool,
    verticalAlign: PropTypes.number,
    style: PropTypes.object,
  };

  static defaultProps = {
    startOpen: true,
    verticalAlign: 4,
  };

  constructor(props) {
    super(props);
    this.state = { open: Boolean(this.props.startOpen) };
  }

  toggleOpen = () => {
    this.setState(state => ({
      open: !state.open,
    }));
  };

  render() {
    return (
      <div className={css(styles.collapsible)} style={this.props.style}>
        <div className={css(styles.head)} onClick={this.toggleOpen}>
          {Boolean(this.props.children) && (
            <div className={css(styles.opener)} style={{ top: this.props.verticalAlign }}>
              {this.state.open ? (
                <span className={css(styles.expandedArrow)} />
              ) : (
                <span className={css(styles.collapsedArrow)} />
              )}
            </div>
          )}
          {this.props.head}
        </div>
        {this.state.open && this.props.children}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  collapsible: {
    paddingLeft: 10,
  },

  head: {
    display: 'flex',
    position: 'relative',
    cursor: 'pointer',
  },

  opener: {
    cursor: 'pointer',
    marginLeft: -10,
    paddingRight: 3,
    position: 'absolute',
  },

  collapsedArrow: {
    borderColor: 'transparent transparent transparent var(--dataview-arrow)',
    borderStyle: 'solid',
    borderWidth: '4px 0 4px 7px',
    display: 'inline-block',
    marginLeft: 1,
    verticalAlign: 'top',
  },

  expandedArrow: {
    borderColor: 'var(--dataview-arrow) transparent transparent transparent',
    borderStyle: 'solid',
    borderWidth: '7px 4px 0 4px',
    display: 'inline-block',
    marginTop: 1,
    verticalAlign: 'top',
  },
});
