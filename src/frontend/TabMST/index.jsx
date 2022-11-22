import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import Player from './Player';
import injectStores from '../../utils/injectStores';
import SecondaryPanel from '../SecondaryPanel';
import ButtonRecord from '../SecondaryPanel/ButtonRecord';
import ButtonClear from '../SecondaryPanel/ButtonClear';
import SplitPane from '../SplitPane';
import TabsMenu from './TabsMenu';
import MstLog from './MstLog';
import LogItemExplorer from './LogItemExplorer';

@injectStores({
  subscribe: {
    capabilitiesStore: ['mstFound'],
    mstLoggerStore: [
      'mstLogItems',
      'mstLogEnabled',
      'activeRootId',
      'activeLogItemId',
      'mstRootsUpdated',
    ],
  },
  injectProps: ({ mstLoggerStore, capabilitiesStore }) => {
    const itemData = mstLoggerStore.itemsDataByRootId[mstLoggerStore.activeRootId];
    return {
      mstFound: capabilitiesStore.mstFound,
      length: itemData ? itemData.logItemsIds.length : 0,
      activeLogItemIndex: itemData && itemData.activeLogItemIndex,
      rootsIds: Object.keys(mstLoggerStore.itemsDataByRootId),
      rootNamesById: mstLoggerStore.rootNamesById,
      mstLogEnabled: mstLoggerStore.mstLogEnabled,
      activeRootId: mstLoggerStore.activeRootId,
      toggleMstLogging() {
        mstLoggerStore.toggleMstLogging();
      },
      commitAll() {
        mstLoggerStore.commitAll();
      },
      activateRootId(id) {
        mstLoggerStore.activateRootId(id);
      },
      activateLogItemIndex(index) {
        mstLoggerStore.activateLogItemId(itemData.logItemsIds[index]);
      },
    };
  },
})
export default class TabMST extends React.PureComponent {
  static propTypes = {
    mstFound: PropTypes.bool,
    mstLogEnabled: PropTypes.bool,
    length: PropTypes.number.isRequired,
    rootsIds: PropTypes.array.isRequired,
    rootNamesById: PropTypes.object.isRequired,
    activeRootId: PropTypes.any,
    activeLogItemIndex: PropTypes.any,
    toggleMstLogging: PropTypes.func.isRequired,
    activateRootId: PropTypes.func.isRequired,
    activateLogItemIndex: PropTypes.func.isRequired,
    commitAll: PropTypes.func.isRequired,
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = e => {
    switch (e.keyCode) {
      case 37:
      case 38: {
        // left arrow
        // up arrow
        if (this.props.activeLogItemIndex > 0) {
          e.preventDefault();
          this.props.activateLogItemIndex(this.props.activeLogItemIndex - 1);
        }
        break;
      }
      case 39:
      case 40: {
        // right arrow
        // down arrow
        if (this.props.activeLogItemIndex < this.props.length - 1) {
          e.preventDefault();
          this.props.activateLogItemIndex(this.props.activeLogItemIndex + 1);
        }
        break;
      }
      default:
        break;
    }
  };

  // eslint-disable-next-line class-methods-use-this
  leftRenderer = () => <MstLog />;

  // eslint-disable-next-line class-methods-use-this
  rightRenderer = () => <LogItemExplorer />;

  render() {
    if (!this.props.mstFound) return null;

    if (this.props.rootsIds.length === 0) {
      return <div className={css(styles.emptyState)}>No roots</div>;
    }

    const tabs = this.props.rootsIds.map(id => ({
      id,
      title: this.props.rootNamesById[id] || String(id),
    }));

    /* eslint-disable react/no-array-index-key */
    return (
      <div
        className={css(styles.tabmst)}
        ref={el => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.containerEl = el;
        }}
      >
        <SecondaryPanel>
          <ButtonRecord
            active={this.props.mstLogEnabled}
            onClick={this.props.toggleMstLogging}
            showTipStartRecoding={!this.props.mstLogEnabled && this.props.length === 0}
          />
          <ButtonClear onClick={this.props.commitAll} />
        </SecondaryPanel>
        <TabsMenu
          tabs={tabs}
          onChange={this.props.activateRootId}
          currentTabId={this.props.activeRootId}
        />
        <SplitPane
          initialWidth={10}
          initialHeight={10}
          left={this.leftRenderer}
          right={this.rightRenderer}
          isVertical={false}
        />
        <Player
          currentIndex={this.props.activeLogItemIndex}
          length={this.props.length}
          onIndexChange={this.props.activateLogItemIndex}
        />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  emptyState: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    color: '#777',
    fontWeight: 'bold',
  },
  tabmst: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
  },
});
