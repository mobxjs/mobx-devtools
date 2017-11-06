import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import injectStores from '../../../utils/injectStores';
import DataViewer from '../../DataViewer';
import Collapsible from '../../Collapsible';

@injectStores({
  subscribe: ({ treeExplorerStore }) => ({
    treeExplorerStore: [treeExplorerStore.selectedNodeId, 'selectedNodeId'],
  }),
  injectProps: ({ treeExplorerStore }) => {
    const node = treeExplorerStore.nodesById[treeExplorerStore.selectedNodeId];
    return {
      node,
      selectedNodeId: treeExplorerStore.selectedNodeId,
      showMenu(e, val, path) {
        e.preventDefault();
        treeExplorerStore.showContextMenu(
          'attr',
          e,
          treeExplorerStore.selectedNodeId,
          node,
          val,
          path
        );
      },
      inspect(path) {
        treeExplorerStore.inspect(path);
      },
      stopInspecting(path) {
        treeExplorerStore.stopInspecting(path);
      },
      change(path, value) {
        treeExplorerStore.changeValue({ path, value });
      },
      getValueByPath(path) {
        return path.reduce(
          (acc, next) => acc && acc[next],
          treeExplorerStore.nodesById[treeExplorerStore.selectedNodeId]
        );
      },
    };
  },
})
export default class TreeComponentExplorer extends React.Component {
  static propTypes = {
    node: PropTypes.object,
    change: PropTypes.func.isRequired,
    getValueByPath: PropTypes.func,
    inspect: PropTypes.func,
    stopInspecting: PropTypes.func,
    showMenu: PropTypes.func,
  };

  componentDidMount() {
    window.e = this;
  }

  reload() {
    this.props.inspect([], () => this.setState({}));
  }

  dataDecorator = injectStores({
    subscribe: (stores, { path }) => ({
      treeExplorerStore: [`inspected--${path.join('/')}`],
    }),
    shouldUpdate: () => true,
  });

  render() {
    const { node } = this.props;
    if (!node) return null;
    return (
      <div>
        <div className={css(styles.heading)}>
          <span className={css(styles.headingBracket)}>{'<'}</span>
          {node.name}
          <span className={css(styles.headingBracket)}>{'/>'}</span>
          {__DEV__ && ` ${node.id}`}
        </div>
        {node.dependencyTree && (
          <Collapsible
            startOpen={false}
            head={
              <div className={css(styles.subheading)}>
                Dependencies ({node.dependencyTree.dependencies.length})
              </div>
            }
          >
            <div className={css(styles.block)}>
              <DataViewer
                path={['dependencyTree']}
                getValueByPath={this.props.getValueByPath}
                inspect={this.props.inspect}
                stopInspecting={this.props.stopInspecting}
                change={this.props.change}
                showMenu={this.props.showMenu}
                decorator={this.dataDecorator}
              />
            </div>
          </Collapsible>
        )}

        <DataViewer
          path={['component']}
          getValueByPath={this.props.getValueByPath}
          inspect={this.props.inspect}
          stopInspecting={this.props.stopInspecting}
          change={this.props.change}
          showMenu={this.props.showMenu}
          decorator={this.dataDecorator}
          hidenKeysRegex={/^(__\$mobRenderEnd|__\$mobRenderStart|_reactInternalInstance|updater)$/}
        />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 17,
    color: 'var(--treenode-tag-name)',
    fontFamily: 'var(--font-family-monospace)',
    fontWeight: 500,
    marginBottom: 15,
  },
  headingBracket: {
    color: 'var(--treenode-bracket)',
  },
  block: {
    marginBottom: 15,
  },
  subheading: {
    color: 'var(--lighter-text-color)',
    textTransform: 'uppercase',
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 500,
  },
});
