import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import PropTypes from 'prop-types';
import injectStores from '../../utils/injectStores';
import DataViewer from '../DataViewer';
import Collapsible from '../Collapsible';
import PreviewValue from '../PreviewValue';

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
        {this.props.logItem.patches && !this.props.initial && (
          <div className={css(styles.patches)}>
            {this.props.logItem.patches.map((patch) => {
              const path = patch.path.replace(/^\//, '').replace(/\//g, '.');
              switch (patch.op) {
                case 'remove':
                  return (
                    <div>{path} <span className={css(styles.removedLabel)}>Removed</span></div>
                  );
                default: return (
                  <div>{path} = <PreviewValue data={patch.value} /></div>
                );
              }
            })}
          </div>
        )
        }
      </div>
    );
  }
}

const styles = StyleSheet.create({
  logExplorer: {
    flex: '1 1 auto',
    padding: 5,
    overflow: 'auto',
  },
  patches: {
    marginTop: 20,
    paddingLeft: 15,
  },
  removedLabel: {
    textTransform: 'uppercase',
    fontSize: 10,
    color: '#c41a16',
  },
});
