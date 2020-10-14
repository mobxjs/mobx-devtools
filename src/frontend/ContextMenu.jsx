import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { css, StyleSheet } from 'aphrodite';
import injectStores from '../utils/injectStores';

const MIN_WIDTH = 150;

@injectStores({
  subscribe: {
    treeExplorerStore: ['contextMenu'],
    actionsLoggerStore: ['contextMenu'],
  },
  injectProps: ({ treeExplorerStore, actionsLoggerStore }) => ({
    contextMenu: treeExplorerStore.contextMenu || actionsLoggerStore.contextMenu,
  }),
})
export default class ContextMenu extends React.Component {
  static propTypes = {
    contextMenu: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      items: PropTypes.array.isRequired,
      close: PropTypes.func.isRequired,
    }),
  };

  componentWillMount() {
    this.portalHtmlEl = document.createElement('div');
    document.body.appendChild(this.portalHtmlEl);
  }

  componentDidMount() {
    if (this.props.contextMenu) {
      this.subscribeClickOutside();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contextMenu && !nextProps.contextMenu) {
      this.unsubscribeClickOutside();
    } else if (!this.props.contextMenu && nextProps.contextMenu) {
      this.subscribeClickOutside();
    }
  }

  componentWillUnmount() {
    document.body.removeChild(this.portalHtmlEl);
  }

  subscribeClickOutside() {
    if (this.$subscribed) return;
    this.$subscribed = true;
    window.addEventListener('click', this.handleClickOutside, true);
  }

  unsubscribeClickOutside() {
    if (!this.$subscribed) return;
    this.$subscribed = false;
    window.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = e => {
    if (this.el && this.el.contains(e.target)) return;
    this.props.contextMenu.close();
    this.unsubscribeClickOutside();
  };

  render() {
    const { contextMenu } = this.props;
    if (!this.props.contextMenu) return null;

    return ReactDOM.createPortal(
      <div
        className={css(styles.container)}
        style={{ left: Math.min(contextMenu.x, window.innerWidth - MIN_WIDTH), top: contextMenu.y }}
        ref={el => {
          this.el = el;
        }}
      >
        {contextMenu.items.map(
          item =>
            item && (
              <div className={css(styles.item)} key={item.key} onClick={item.action}>
                {item.title}
              </div>
            ),
        )}
      </div>,
      this.portalHtmlEl,
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    backgroundColor: '#fff',
    border: '1px solid #eee',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    minWidth: MIN_WIDTH,
    zIndex: 100002,
  },
  item: {
    color: '--default-text-color',
    padding: '5px 10px',
    cursor: 'pointer',
    ':not(:last-child)': {
      borderBottom: '1px solid #eee',
    },
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
});
