import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import injectStores from '../../../utils/injectStores';

function getBreadcrumbPath(store) {
  const path = [];
  let current = store.breadcrumbHead;
  while (current) {
    path.unshift({
      id: current,
      node: store.nodesById[current],
    });
    current = store.getParent(current);
  }
  return path;
}

@injectStores({
  subscribe: {
    treeExplorerStore: ['breadcrumbHead', 'selectedNodeId'],
  },
  injectProps: ({ treeExplorerStore }) => ({
    select: id => treeExplorerStore.selectBreadcrumb(id),
    hover: (id, isHovered) => treeExplorerStore.setHover(id, isHovered, false),
    selectedId: treeExplorerStore.selectedNodeId,
    path: getBreadcrumbPath(treeExplorerStore),
  }),
})
export default class Breadcrumb extends React.Component {
  static propTypes = {
    selectedId: PropTypes.any,
    path: PropTypes.array.isRequired,
    select: PropTypes.func.isRequired,
    hover: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { hovered: null };
  }

  handleCrumbMouseOver(id) {
    this.setState({ hovered: id });
    this.props.hover(id, true);
  }

  handleCrumbMouseOut(id) {
    this.setState({ hovered: null });
    this.props.hover(id, false);
  }

  render() {
    return (
      <ul className={css(styles.container)}>
        {this.props.path.map(({ id, node }) => {
          const isSelected = id === this.props.selectedId;
          const className = css(styles.item, isSelected && styles.itemSelected);
          return (
            <li
              className={className}
              key={id}
              // eslint-disable-next-line react/jsx-no-bind
              onMouseOver={() => this.handleCrumbMouseOver(id)}
              // eslint-disable-next-line react/jsx-no-bind
              onMouseOut={() => this.handleCrumbMouseOut(id)}
              // eslint-disable-next-line react/jsx-no-bind
              onClick={isSelected ? null : () => this.props.select(id)}
            >
              {node.name || `"${node.text}"`}
            </li>
          );
        })}
      </ul>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    fontSize: 12,
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: 80,
    overflow: 'auto',
    backgroundColor: 'var(--bar-color)',
    borderTop: '1px solid var(--bar-border-color)',
  },
  item: {
    padding: '1px 4px',
    userSelect: 'none',
    display: 'inline-block',
    cursor: 'pointer',
    opacity: 0.8,
    color: 'var(--lighter-text-color)',
  },
  itemSelected: {
    color: 'var(--default-text-color)',
    backgroundColor: 'var(--bar-active-button-bg)',
    cursor: 'default',
    opacity: 1,
  },
});
