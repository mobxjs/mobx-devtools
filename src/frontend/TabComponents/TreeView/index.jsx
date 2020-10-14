import PropTypes from 'prop-types';
import React from 'react';
import { css, StyleSheet } from 'aphrodite';
import Node from './Node';
import * as SearchUtils from '../../../utils/SearchUtils';
import Spinner from '../../Spinner';
import injectStores from '../../../utils/injectStores';

const MAX_SEARCH_ROOTS = 200;

@injectStores({
  subscribe: {
    treeExplorerStore: ['roots', 'searchRoots', 'loaded'],
  },
  injectProps: ({ treeExplorerStore }) => ({
    roots: treeExplorerStore.searchRoots || treeExplorerStore.roots,
    searchText: treeExplorerStore.searchText,
    searching: treeExplorerStore.searchText !== '',
    loaded: treeExplorerStore.loaded,
    getComponents: () => treeExplorerStore.getComponents(),
    reset: () => treeExplorerStore.reset(),
    selectInDirection(direction) {
      const roots = treeExplorerStore.searchRoots || treeExplorerStore.roots;
      const parentId = treeExplorerStore.nodeParentsById[treeExplorerStore.selectedNodeId];
      const siblingsIds = parentId ? treeExplorerStore.nodesById[parentId].children : roots;
      const childrenIds = treeExplorerStore.nodesById[treeExplorerStore.selectedNodeId].children;
      const isBottomTag = treeExplorerStore.isBottomTagSelected;
      const { collapsed } = treeExplorerStore.nodesById[treeExplorerStore.selectedNodeId];
      switch (direction) {
        case 'up': {
          const sidx = siblingsIds.indexOf(treeExplorerStore.selectedNodeId);
          if (isBottomTag && childrenIds.length > 0) {
            const lastChildId = childrenIds[childrenIds.length - 1];
            if (treeExplorerStore.nodesById[lastChildId].collapsed) {
              treeExplorerStore.selectBottom(lastChildId);
            } else {
              treeExplorerStore.selectTop(lastChildId);
            }
          } else if (sidx !== -1 && sidx !== 0) {
            treeExplorerStore.selectBottom(siblingsIds[sidx - 1]);
          } else if (parentId) {
            treeExplorerStore.selectTop(parentId);
          }
          break;
        }
        case 'down': {
          const sidx = siblingsIds.indexOf(treeExplorerStore.selectedNodeId);
          if (!isBottomTag && !collapsed && childrenIds.length > 0) {
            treeExplorerStore.selectTop(childrenIds[0]);
          } else if (sidx !== -1 && sidx !== siblingsIds.length - 1) {
            treeExplorerStore.selectTop(siblingsIds[sidx + 1]);
          } else if (parentId) {
            treeExplorerStore.selectBottom(parentId);
          }
          break;
        }
        case 'left': {
          if (!collapsed) {
            treeExplorerStore.collapse(treeExplorerStore.selectedNodeId);
            treeExplorerStore.selectTop(treeExplorerStore.selectedNodeId);
          } else if (parentId) {
            treeExplorerStore.selectTop(parentId);
          }
          break;
        }
        case 'right': {
          if (collapsed) {
            treeExplorerStore.uncollapse(treeExplorerStore.selectedNodeId);
          } else if (childrenIds.length > 0) {
            treeExplorerStore.selectTop(childrenIds[0]);
          }
          break;
        }
        default:
          break;
      }
    },
  }),
})
export default class TreeView extends React.Component {
  static propTypes = {
    roots: PropTypes.array.isRequired,
    searchText: PropTypes.string,
    searching: PropTypes.bool.isRequired,
    getComponents: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    selectInDirection: PropTypes.func.isRequired,
    loaded: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.props.getComponents();
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.props.reset();
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  node = undefined;

  handleKeyDown = e => {
    switch (e.keyCode) {
      case 38: {
        // up arrow
        e.preventDefault();
        this.props.selectInDirection('up');
        break;
      }
      case 40: {
        // down arrow
        e.preventDefault();
        this.props.selectInDirection('down');
        break;
      }
      case 37: {
        // left arrow
        e.preventDefault();
        this.props.selectInDirection('left');
        break;
      }
      case 39: {
        // right arrow
        e.preventDefault();
        this.props.selectInDirection('right');
        break;
      }
      default:
        break;
    }
  };

  scrollTo(toNode) {
    if (!this.node) {
      return;
    }
    let val = 0;
    const height = toNode.offsetHeight;

    let offsetParentNode = toNode;
    while (offsetParentNode && this.node.contains(offsetParentNode)) {
      val += offsetParentNode.offsetTop;
      offsetParentNode = offsetParentNode.offsetParent;
    }

    const top = this.node.scrollTop;
    const rel = val - this.node.offsetTop;
    const margin = 40;
    if (top > rel - margin) {
      this.node.scrollTop = rel - margin;
    } else if (top + this.node.offsetHeight < rel + height + margin) {
      this.node.scrollTop = rel - this.node.offsetHeight + height + margin;
    }
  }

  render() {
    if (!this.props.roots.length) {
      if (this.props.searching) {
        return (
          <div className={css(styles.container)}>
            <span className={css(styles.noSearchResults)}>Nothing found</span>
          </div>
        );
      }
      return (
        <div className={css(styles.container)}>
          {this.props.loaded ? (
            <span className={css(styles.noSearchResults)}>No observers</span>
          ) : (
            <Spinner />
          )}
        </div>
      );
    }

    // Convert search text into a case-insensitive regex for match-highlighting.
    const { searchText } = this.props;
    const searchRegExp = SearchUtils.isValidRegex(searchText)
      ? SearchUtils.searchTextToRegExp(searchText)
      : null;

    if (this.props.searching && this.props.roots.length > MAX_SEARCH_ROOTS) {
      return (
        <div className={css(styles.container)}>
          <div
            ref={n => {
              this.node = n;
            }}
            className={css(styles.scroll)}
          >
            <div className={css(styles.scrollContents)}>
              {this.props.roots.slice(0, MAX_SEARCH_ROOTS).map(id => (
                <Node depth={0} id={id} key={id} searchRegExp={searchRegExp} />
              ))}
              <span>Some results not shown. Narrow your search criteria to find them</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={css(styles.container)}>
        <div
          ref={n => {
            this.node = n;
          }}
          className={css(styles.scroll)}
        >
          <div className={css(styles.scrollContents)}>
            {this.props.roots.map(id => (
              <Node depth={0} id={id} key={id} searchRegExp={searchRegExp} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    fontFamily: 'var(--font-family-monospace)',
    fontSize: 12,
    lineHeight: 1.3,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    userSelect: 'none',

    ':after': {
      opacity: 0.5,
      content: '""',
      width: 7,
      height: '100%',
      backgroundImage: 'linear-gradient(to right, transparent, #fff) !important',
      position: 'absolute',
      top: 0,
      right: 0,
      pointerEvents: 'none',
    },
  },

  scroll: {
    overflow: 'auto',
    minHeight: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
  },

  scrollContents: {
    flexDirection: 'column',
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    padding: 5,
  },

  noSearchResults: {
    color: '#777',
    // fontFamily: sansSerif.family,
    // fontSize: sansSerif.sizes.normal,
    padding: '10px',
    fontWeight: 'bold',
  },
});
