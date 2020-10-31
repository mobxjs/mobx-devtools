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
      mstLoggerStore: ['selectedLogItemId', itemData && itemData.selectedLogItemId],
    };
  },
  injectProps: ({ mstLoggerStore }) => {
    const itemData = mstLoggerStore.itemsDataByRootId[mstLoggerStore.activeRootId];
    const logItem = itemData && itemData.logItemsById[itemData.selectedLogItemId];
    const initial = itemData && itemData.logItemsIds[0] === itemData.selectedLogItemId;
    const initialData = mstLoggerStore.initialRootByRootId[mstLoggerStore.activeRootId];
    return {
      logItem,
      initial,
      initialData,
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
    initialData: PropTypes.object,
    getValueByPath: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      logExplorerHeight: 400,
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
      logExplorerHeight: this.containerEl.offsetHeight,
    });
  }

  dataDecorator = injectStores({
    subscribe: (stores, { path }) => ({
      treeExplorerStore: [`inspected--${path.join('/')}`],
    }),
    shouldUpdate: () => true,
  });

  render() {
    if (!this.props.logItem) return null;
    const padding = 5;
    return (
      <div
        className={css(styles.logExplorer)}
        ref={el => {
          this.containerEl = el;
        }}
        style={{ padding, height: this.state.logExplorerHeight - padding * 2 }}
      >
        {this.props.initial && this.props.initialData && (
          <Collapsible head="State" startOpen>
            <div>{JSON.stringify(this.props.initialData)}</div>
          </Collapsible>
        )}
        {this.props.logItem.snapshot && (
          <Collapsible head="State" startOpen>
            <DataViewer
              path={['snapshot']}
              getValueByPath={this.props.getValueByPath}
              decorator={this.dataDecorator}
            />
          </Collapsible>
        )}
        {this.props.logItem.patches && !this.props.initial && (
          <div className={css(styles.patches)}>
            {this.props.logItem.patches.map(patch => {
              const path = patch.path.replace(/^\//, '').replace(/\//g, '.');
              switch (patch.op) {
                case 'remove':
                  return (
                    <div>
                      {path} <span className={css(styles.removedLabel)}>Removed</span>
                    </div>
                  );
                default:
                  return (
                    <div>
                      {path} = <PreviewValue data={patch.value} />
                    </div>
                  );
              }
            })}
          </div>
        )}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  logExplorer: {
    flex: '1 1 auto',
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
