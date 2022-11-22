import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import List from 'react-virtualized/dist/commonjs/List';
import injectStores from '../../utils/injectStores';
import MstLogItem from './MstLogItem';

const ITEM_HEIGHT = 30;

@injectStores({
  subscribe: {
    mstLoggerStore: ['mstLogItems', 'activeRootId', 'selectedLogItemId', 'activeLogItemId'],
  },
  injectProps: ({ mstLoggerStore }) => {
    const itemData = mstLoggerStore.itemsDataByRootId[mstLoggerStore.activeRootId];
    return {
      logItemsIds: itemData ? itemData.logItemsIds : [],
      logItemsById: itemData ? itemData.logItemsById : [],
      selectedLogItemId: itemData && itemData.selectedLogItemId,
      activeLogItemId: itemData && itemData.activeLogItemId,
      activeRootId: mstLoggerStore.activeRootId,
      activateLogItemId(id) {
        mstLoggerStore.activateLogItemId(id);
      },
      commitLogItemId(id) {
        mstLoggerStore.commitLogItemId(id);
      },
      cancelLogItemId(id) {
        mstLoggerStore.cancelLogItemId(id);
      },
      selectLogItemId(id) {
        mstLoggerStore.selectLogItemId(id);
      },
    };
  },
})
export default class Log extends React.PureComponent {
  static propTypes = {
    logItemsIds: PropTypes.array.isRequired,
    logItemsById: PropTypes.object.isRequired,
    activeRootId: PropTypes.any,
    selectedLogItemId: PropTypes.any,
    activeLogItemId: PropTypes.any,
    activateLogItemId: PropTypes.func.isRequired,
    cancelLogItemId: PropTypes.func.isRequired,
    commitLogItemId: PropTypes.func.isRequired,
    selectLogItemId: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      listHeight: 400,
      listWidth: 400,
      autoScroll: true,
    };
  }

  componentDidMount() {
    this.resizeTimeout = setTimeout(() => this.updateSize(), 0); // timeout for css applying
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (this.resizeTimeout) return;
    this.resizeTimeout = setTimeout(() => {
      this.updateSize();
    }, 200);
  };

  updateSize() {
    if (!this.containerEl) return;
    this.resizeTimeout = undefined;
    this.setState({
      listWidth: this.containerEl.offsetWidth,
      listHeight: this.containerEl.offsetHeight,
    });
  }

  handleScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    const autoScroll = scrollTop >= scrollHeight - clientHeight;
    if (autoScroll !== this.state.autoScroll) {
      this.setState({ autoScroll });
    }
  };

  renderItem = ({ index, style, key }) => {
    const logItem = this.props.logItemsById[this.props.logItemsIds[index]];
    return (
      <MstLogItem
        style={style}
        key={key}
        logItem={logItem}
        selected={this.props.selectedLogItemId === logItem.id}
        last={index === this.props.logItemsIds.length - 1}
        active={this.props.activeLogItemId === logItem.id}
        initial={index === 0}
        onSelect={this.props.selectLogItemId}
        onCommit={this.props.commitLogItemId}
        onCancel={this.props.cancelLogItemId}
        onActivate={this.props.activateLogItemId}
      />
    );
  };

  render() {
    if (!this.props.activeRootId) return null;
    const padding = 5;
    const rowCount = this.props.logItemsIds.length;
    return (
      <div
        className={css(styles.logItems)}
        ref={el => {
          this.containerEl = el;
        }}
      >
        <List
          ref={list => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.list = list;
          }}
          onScroll={this.handleScroll}
          style={{ width: 'auto', padding, boxSizing: 'content-box' }}
          containerStyle={{ width: 'auto', maxWidth: 'none' }}
          width={this.state.listWidth - padding * 2}
          height={this.state.listHeight - padding * 2}
          rowCount={rowCount}
          scrollToIndex={this.state.autoScroll && rowCount > 0 ? rowCount - 1 : undefined}
          rowHeight={ITEM_HEIGHT}
          overscanCount={1}
          rowRenderer={this.renderItem}
        />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  logItems: {
    width: '100%',
  },
});
