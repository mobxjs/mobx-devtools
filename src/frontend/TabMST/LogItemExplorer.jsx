import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import PropTypes from 'prop-types';
import JSONTree from './JSONTree';
import injectStores from '../../utils/injectStores';
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
    };
  },
})
export default class LogItemExplorer extends React.PureComponent {
  static propTypes = {
    logItem: PropTypes.object,
    initial: PropTypes.bool.isRequired,
    initialData: PropTypes.object,
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
        <Collapsible head="State" startOpen>
          {this.props.initial && this.props.initialData && (
            <JSONTree data={this.props.initialData} />
          )}
          {!this.props.initial && this.props.logItem.snapshot && (
            <JSONTree data={this.props.logItem.snapshot} />
          )}
        </Collapsible>
        {this.props.logItem.patches && !this.props.initial && (
          <div className={css(styles.patches)}>
            {this.props.logItem.patches.map(patch => {
              const path = patch.path.replace(/^\//, '').replace(/\//g, '.');
              const key = `${path}-${patch.op}`;
              switch (patch.op) {
                case 'remove':
                  return (
                    <div key={key}>
                      {path} <span className={css(styles.removedLabel)}>Removed</span>
                    </div>
                  );
                default:
                  return (
                    <div key={key}>
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
