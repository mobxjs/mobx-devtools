import PropTypes from 'prop-types';
import React from 'react';
import { css, StyleSheet } from 'aphrodite';

export default class ModalContainer extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    onOverlayClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    children: undefined,
  };

  componentDidUpdate(prevProps) {
    const html = document.body.parentNode;
    if (prevProps.children && !this.props.children) {
      // Disappeared
      html.style.borderRight = null;
      html.style.overflow = null;
    } else if (!prevProps.children && this.props.children) {
      // Appeared
      const prevTotalWidth = html.offsetWidth;
      html.style.overflow = 'hidden';
      const nextTotalWidth = html.offsetWidth;
      const rightOffset = Math.max(0, nextTotalWidth - prevTotalWidth);
      html.style.borderRight = `${rightOffset}px solid transparent`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  stopPropagation = e => e.stopPropagation();

  render() {
    const { children, onOverlayClick } = this.props;
    if (!children) return null;
    return (
      <div className={css(styles.overlay)} onClick={onOverlayClick}>
        <div key="content" className={css(styles.modal)} onClick={this.stopPropagation}>
          {children}
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 66000,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    outline: 0,
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
    transformOrigin: '50% 25%',
  },

  modal: {
    position: 'relative',
    width: 'auto',
    margin: '5% 10%',
    zIndex: 1060,
  },
});
