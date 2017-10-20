import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import SecondaryPanel from '../SecondaryPanel';
import ButtonPickComponent from '../SecondaryPanel/ButtonPickComponent';
import SearchComponents from './SearchComponents';
import injectStores from '../../utils/injectStores';
import TreeView from './TreeView';
import SplitPane from '../SplitPane';
import Breadcrumb from './TreeView/Breadcrumb';
import TreeComponentExplorer from './TreeComponentExplorer';

@injectStores({
  subscribe: {
    treeExplorerStore: ['pickingComponent'],
  },
  injectProps: ({ treeExplorerStore }) => ({
    pickingComponent: treeExplorerStore.pickingComponent,
    togglePickingTreeExplorerComponent() {
      if (treeExplorerStore.pickingComponent) {
        treeExplorerStore.stopPickingComponent();
      } else {
        treeExplorerStore.pickComponent();
      }
    },
  }),
})
export default class TabComponents extends React.PureComponent {
  static propTypes = {
    pickingComponent: PropTypes.bool.isRequired,
    togglePickingTreeExplorerComponent: PropTypes.func.isRequired,
  };

  leftRenderer = () => (
    <div className={css(styles.leftPane)}>
      <SecondaryPanel>
        <ButtonPickComponent
          onClick={this.props.togglePickingTreeExplorerComponent}
          active={this.props.pickingComponent}
        />
        <SearchComponents />
      </SecondaryPanel>
      <TreeView />
      <div className={css(styles.footer)}>
        <Breadcrumb />
      </div>
    </div>
  );

  rightRenderer = () => (
    <div className={css(styles.rightPane)}>
      <TreeComponentExplorer />
    </div>
  );

  render() {
    return (
      <div className={css(styles.panel)}>
        <div className={css(styles.panelBody)}>
          <SplitPane
            initialWidth={10}
            initialHeight={10}
            left={this.leftRenderer}
            right={this.rightRenderer}
            isVertical={false}
          />
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  panelBody: {
    display: 'flex',
    flex: '1 1 auto',
  },
  leftPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  rightPane: {
    flex: '1 1 auto',
    overflow: 'auto',
    padding: 10,
  },
});
