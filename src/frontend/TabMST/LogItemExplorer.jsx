import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import PropTypes from 'prop-types';
import injectStores from '../../utils/injectStores';
import DataViewer from '../DataViewer';
import Collapsible from '../Collapsible';

@injectStores({
  subscribe: ({ mstLoggerStore }) => {
    const itemData = mstLoggerStore.itemsDataByRootId[mstLoggerStore.activeRootId];
    return {
      mstLoggerStore: [
        'selectedLogItemId',
        itemData && itemData.selectedLogItemId,
      ],
    };
  },
  injectProps: ({ mstLoggerStore }) => {
    const itemData = mstLoggerStore.itemsDataByRootId[mstLoggerStore.activeRootId];
    const logItem = itemData && itemData.logItemsById[itemData.selectedLogItemId];
    const initial = itemData && itemData.logItemsIds[0] === itemData.selectedLogItemId;
    return {
      logItem,
      initial,
      getValueByPath(path) {
        return path.reduce((acc, next) => acc && acc[next], logItem);
      },
    };
  },
})
export default class LogItemExplorer extends React.PureComponent {
  static propTypes = {
    logItem: PropTypes.object,
    initial: PropTypes.bool.isRequired,
    getValueByPath: PropTypes.func.isRequired,
  };

  dataDecorator = injectStores({
    subscribe: (stores, { path }) => ({
      treeExplorerStore: [`inspected--${path.join('/')}`],
    }),
    shouldUpdate: () => true,
  });

  render() {
    if (!this.props.logItem) return null;
    return (
      <div className={css(styles.logExplorer)}>
        {this.props.logItem.snapshot &&
          <Collapsible head={'State'} startOpen>
            <DataViewer
              path={['snapshot']}
              getValueByPath={this.props.getValueByPath}
              decorator={this.dataDecorator}
            />
          </Collapsible>
        }
        {this.props.logItem.patch && !this.props.initial &&
          <Collapsible head={'Patch'} startOpen>
            <DataViewer
              path={['patch']}
              getValueByPath={this.props.getValueByPath}
              decorator={this.dataDecorator}
            />
          </Collapsible>
        }
      </div>
    );
  }
}

const styles = StyleSheet.create({
  logExplorer: {
    padding: 5,
    overflow: 'auto',
  },
});
