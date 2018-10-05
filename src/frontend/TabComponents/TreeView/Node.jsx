import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import Props from './Props';
import injectStores from '../../../utils/injectStores';

const Node = @injectStores({
  subscribe: (stores, props) => ({ // eslint-disable-line
    treeExplorerStore: [props.id, 'searchRoots'],
  }),
  injectProps: ({ treeExplorerStore }, props) => {
    const node = treeExplorerStore.nodesById[props.id];
    return {
      node,
      selected: treeExplorerStore.selectedNodeId === props.id,
      isBottomTagSelected: treeExplorerStore.isBottomTagSelected,
      isBottomTagHovered: treeExplorerStore.isBottomTagHovered,
      hovered: treeExplorerStore.hoveredNodeId === props.id,
      searchRegExp: props.searchRegExp,
      scrollTo: () => {},
      onToggleCollapse: (e) => {
        e.preventDefault();
        treeExplorerStore.updateNode({ ...node, collapsed: !node.collapsed });
      },
      onHover: (isHovered) => {
        treeExplorerStore.setHover(props.id, isHovered, false);
      },
      onHoverBottom: (isHovered) => {
        treeExplorerStore.setHover(props.id, isHovered, true);
      },
      onSelect: () => {
        treeExplorerStore.selectTop(props.id);
      },
      onSelectBottom: () => {
        treeExplorerStore.selectBottom(props.id);
      },
      onContextMenu: (e) => {
        e.preventDefault();
        treeExplorerStore.showContextMenu('tree', e, props.id, node);
      },
    };
  },
})
// eslint-disable-next-line indent
class _Node extends React.Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    isBottomTagSelected: PropTypes.bool,
    isBottomTagHovered: PropTypes.bool,
    hovered: PropTypes.bool.isRequired,
    searchRegExp: PropTypes.instanceOf(RegExp),
    scrollTo: PropTypes.func.isRequired,
    onToggleCollapse: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired,
    onHoverBottom: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectBottom: PropTypes.func.isRequired,
    onContextMenu: PropTypes.func.isRequired,

    id: PropTypes.any.isRequired,
    depth: PropTypes.number,
  };

  static defaultProps = {
    depth: 0,
  };

  componentDidMount() {
    if (this.props.selected) {
      this.ensureInView();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selected && !prevProps.selected) {
      // Gaining selection.
      this.ensureInView();
    }
  }

  $head = undefined;
  $tail = undefined;

  findOwnerWindow() {
    if (!this.$head) {
      return null;
    }
    const doc = this.$head.ownerDocument;
    if (!doc) {
      return null;
    }
    const win = doc.defaultView;
    if (!win) {
      return null;
    }
    return win;
  }

  ensureInView() {
    const node = this.props.isBottomTagSelected ? this.$tail : this.$head;
    if (!node) {
      return;
    }
    this.props.scrollTo(node);
  }

  render() {
    const {
      depth,
      hovered,
      isBottomTagHovered,
      isBottomTagSelected,
      node,
      onContextMenu,
      onHover,
      onHoverBottom,
      onSelect,
      onSelectBottom,
      onToggleCollapse,
      searchRegExp,
      selected,
    } = this.props;

    if (!node) {
      return <span>Node was deleted {__DEV__ && this.props.id}</span>;
    }

    const children = node.children;

    const collapsed = node.collapsed;
    const inverted = selected;

    const headEvents = {
      onContextMenu,
      onDoubleClick: onToggleCollapse,
      onMouseOver: () => onHover(true),
      onMouseOut: () => onHover(false),
      onMouseDown: onSelect,
    };
    const tailEvents = {
      onContextMenu,
      onDoubleClick: onToggleCollapse,
      onMouseOver: () => onHoverBottom(true),
      onMouseOut: () => onHoverBottom(false),
      onMouseDown: onSelectBottom,
    };

    let name = `${node.name}`;

    // If the user's filtering then highlight search terms in the tag name.
    // This will serve as a visual reminder that the visible tree is filtered.
    if (searchRegExp) {
      const unmatched = name.split(searchRegExp);
      const matched = name.match(searchRegExp);
      const pieces = [<span key={0}>{unmatched.shift()}</span>];
      while (unmatched.length > 0) {
        pieces.push(
          <span key={pieces.length} className={css(styles.highlight)}>
            {matched.shift()}
          </span>
        );
        pieces.push(<span key={pieces.length}>{unmatched.shift()}</span>);
      }

      name = <span>{pieces}</span>;
    }

    // Single-line tag (collapsed / simple content / no content)
    if (!children || typeof children === 'string' || !children.length) {
      const content = children;
      const isCollapsed = content === null || content === undefined;
      return (
        <div className={css(styles.container)}>
          <Head
            getRef={(h) => { this.$head = h; }} // eslint-disable-line react/jsx-no-bind
            depth={depth}
            hovered={hovered && !isBottomTagHovered}
            selected={selected && !isBottomTagSelected}
            {...headEvents}
          >
            <span>
              <span className={css(styles.bracket)}>&lt;</span>
              <span className={css(styles.jsxTag)}>{name}</span>
              {node.key && <Props key="key" props={{ key: node.key }} />}
              {node.ref && <Props key="ref" props={{ ref: node.ref }} />}
              {node.props && <Props key="props" props={node.props} />}
              <span className={css(styles.bracket)}>{isCollapsed ? ' />' : '>'}</span>
            </span>
            {!isCollapsed && [
              <span key="content">{content}</span>,
              <span key="close">
                <span className={css(styles.bracket)}>&lt;/</span>
                <span className={css(styles.jsxTag)}>{name}</span>
                <span className={css(styles.bracket)}>&gt;</span>
              </span>,
            ]}
            {selected && <span className={css(styles.tmpValueName)}> == $m</span>}
          </Head>
        </div>
      );
    }

    const closeTag = (
      <span>
        <span className={css(styles.bracket)}>&lt;/</span>
        <span className={css(styles.jsxTag)}>{name}</span>
        <span className={css(styles.bracket)}>&gt;</span>
        {selected &&
          ((collapsed && !this.props.isBottomTagSelected) || this.props.isBottomTagSelected) && (
          <span className={css(styles.tmpValueName)}> == $m</span>
        )}
      </span>
    );

    const hasState = !!node.state || !!node.context;
    const headInverted = inverted && !isBottomTagSelected;

    const collapserStyle = { left: calcPaddingLeft(depth) - 12 };

    const collapserClassName = css(styles.collapser);

    const collapser = (
      <span
        title={hasState ? 'This component is stateful.' : null}
        onClick={onToggleCollapse}
        style={collapserStyle}
        className={collapserClassName}
      >
        <span className={css(collapsed ? styles.arrowCollapsed : styles.arrowOpen)} />
      </span>
    );

    const head = (
      <Head
        getRef={(h) => { this.$head = h; }} // eslint-disable-line react/jsx-no-bind
        depth={depth}
        hovered={hovered && !isBottomTagHovered}
        selected={selected && !isBottomTagSelected}
        {...headEvents}
      >
        {collapser}
        <span>
          <span className={css(styles.bracket)}>&lt;</span>
          <span className={css(styles.jsxTag)}>{name}</span>
          {node.key && <Props key="key" props={{ key: node.key }} inverted={headInverted} />}
          {node.ref && <Props key="ref" props={{ ref: node.ref }} inverted={headInverted} />}
          {node.props && <Props key="props" props={node.props} inverted={headInverted} />}
          <span className={css(styles.bracket)}>&gt;</span>
          {selected &&
            !collapsed &&
            !this.props.isBottomTagSelected && (
            <span className={css(styles.tmpValueName)}> == $m</span>
          )}
        </span>
        {collapsed && <span>…</span>}
        {collapsed && closeTag}
      </Head>
    );

    if (collapsed) {
      return <div className={css(styles.container)}>{head}</div>;
    }

    return (
      <div className={css(styles.container)}>
        {head}
        <Guideline
          depth={depth}
          hovered={hovered && !isBottomTagHovered}
          selected={selected && !isBottomTagSelected}
        />
        <div>{children.map(id => <Node key={id} depth={depth + 1} id={id} />)}</div>
        <Tail
          getRef={(t) => { this.$tail = t; }} // eslint-disable-line react/jsx-no-bind
          {...tailEvents}
          depth={depth}
          hovered={hovered && isBottomTagHovered}
          selected={selected && isBottomTagSelected}
        >
          {closeTag}
        </Tail>
      </div>
    );
  }
};

export default Node;

Head.propTypes = {
  depth: PropTypes.number,
  hovered: PropTypes.bool,
  selected: PropTypes.bool,
  children: PropTypes.node,
  getRef: PropTypes.func,
};

function Head({ depth, hovered, selected, children, getRef, ...otherProps }) {
  return (
    <div
      ref={getRef}
      className={css(styles.head, hovered && styles.headHovered, selected && styles.headSelected)}
      data-test="components-Node-Head"
      {...otherProps}
    >
      <span
        style={{ paddingLeft: calcPaddingLeft(depth) }}
        className={css(styles.content, selected && styles.selectedContent)}
      >
        {children}
      </span>
    </div>
  );
}

Tail.propTypes = {
  depth: PropTypes.number,
  hovered: PropTypes.bool,
  selected: PropTypes.bool,
  children: PropTypes.node,
  getRef: PropTypes.func,
};
function Tail({ depth, hovered, selected, children, getRef, ...otherProps }) {
  return (
    <div
      ref={getRef}
      className={css(styles.tail, hovered && styles.tailHovered, selected && styles.tailSelected)}
      {...otherProps}
    >
      <span
        style={{ paddingLeft: calcPaddingLeft(depth) }}
        className={css(styles.content, selected && styles.selectedContent)}
      >
        {children}
      </span>
    </div>
  );
}

Guideline.propTypes = {
  depth: PropTypes.number,
  hovered: PropTypes.bool,
  selected: PropTypes.bool,
};

function Guideline({ depth, hovered, selected }) {
  return (
    <div
      style={{ marginLeft: calcPaddingLeft(depth) - 7 }}
      className={css(
        styles.guideline,
        hovered && styles.guidlineHovered,
        selected && styles.guidlineSelected
      )}
    />
  );
}

const calcPaddingLeft = depth => 5 + ((depth + 1) * 10);

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  falseyLiteral: {
    fontStyle: 'italic',
  },
  highlight: {
    backgroundColor: 'var(--treenode-search-highlight)',
  },

  collapser: {
    position: 'absolute',
    padding: 2,
  },

  head: {
    cursor: 'default',
    borderTop: '1px solid transparent',
    borderRadius: 4,
  },
  headHovered: {
    backgroundColor: 'var(--treenode-hovered-bg)',
  },
  headSelected: {
    backgroundColor: 'var(--treenode-selected-bg)',
  },

  guideline: {
    position: 'absolute',
    width: '1px',
    top: 16,
    bottom: 0,
  },
  guidlineSelected: {
    opacity: 0.3,
    backgroundColor: 'var(--primary-color)',
    zIndex: 1,
  },
  guidlineHovered: {
    backgroundColor: 'var(--treenode-hover-guide)',
  },

  tail: {
    borderTop: '1px solid transparent',
    cursor: 'default',
  },
  tailHovered: {
    backgroundColor: 'var(--treenode-hovered-bg)',
  },
  tailSelected: {
    backgroundColor: 'var(--treenode-selected-bg)',
  },

  content: {
    display: 'block',
    position: 'relative',
    paddingRight: 5,
    paddingBottom: 4,
    paddingTop: 4,
  },
  selectedContent: {
    filter: 'contrast(0.1) brightness(2)',
  },

  arrowCollapsed: {
    borderStyle: 'solid',
    borderWidth: '4px 0 4px 6px',
    borderColor: 'transparent transparent transparent var(--treenode-arrow)',
    display: 'inline-block',
    marginLeft: 2,
    verticalAlign: 'top',
  },
  arrowOpen: {
    borderStyle: 'solid',
    borderWidth: '6px 4px 0 4px',
    borderColor: 'var(--treenode-arrow) transparent transparent transparent',
    display: 'inline-block',
    marginTop: 2,
    verticalAlign: 'top',
  },

  bracket: {
    color: 'var(--treenode-bracket)',
  },

  jsxTag: {
    color: 'var(--treenode-tag-name)',
  },

  tmpValueName: {
    color: 'var(--treenode-tag-name)',
    opacity: 0.5,
  },
});
