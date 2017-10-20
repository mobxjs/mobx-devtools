import * as SearchUtils from '../../utils/SearchUtils';
import nodeMatchesText from '../../utils/nodeMatchesText';
import AbstractStore from './AbstractStore';

export default class TreeExplorerStore extends AbstractStore {
  roots = [];
  selectedNodeId = undefined;
  hoveredNodeId = undefined;
  isBottomTagSelected = undefined;
  isBottomTagHovered = undefined;
  nodeParentsById = {};
  nodesById = {};
  searchText = '';
  pickingComponent = false;

  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('frontend:mobx-react-components', (components) => {
        components.forEach(c => this.addNode(c));
        if (this.prevSelectedNodeId && this.nodesById[this.prevSelectedNodeId]) {
          this.select(this.prevSelectedNodeId);
          this.uncollapseParents(this.prevSelectedNodeId);
        }
      })
    );

    this.addDisposer(
      bridge.sub('frontend:mobx-react-component-updated', (component) => {
        this.updateNode(component);
      })
    );

    this.addDisposer(
      bridge.sub('frontend:mobx-react-component-added', (component) => {
        this.addNode(component);
      })
    );

    this.addDisposer(
      bridge.sub('frontend:mobx-react-component-removed', (component) => {
        this.removeNode(component);
      })
    );

    this.addDisposer(
      bridge.sub('picked-component', ({ componentId }) => {
        this.select(componentId, true);
        this.uncollapseParents(componentId);
        this.stopPickingComponent();
      })
    );

    this.addDisposer(
      bridge.sub('inspect-component-result', ({ componentId, path, data }) => {
        const obj = path.reduce((acc, next) => acc && acc[next], this.nodesById[componentId]);
        if (obj) {
          Object.assign(obj, data);
        }
        // if (__DEV__) console.log(`inspected--${path.join('/')}`, data);
        this.emit(`inspected--${path.join('/')}`);
      })
    );
  }

  reset() {
    this.roots.splice(0);
    this.prevSelectedNodeId = this.selectedNodeId;
    this.hoveredNodeId = undefined;
    this.selectedNodeId = undefined;
    this.isBottomTagSelected = undefined;
    this.isBottomTagHovered = undefined;
    this.nodeParentsById = {};
    this.nodesById = {};
    this.breadcrumbHead = undefined;
    this.emit('roots');
    this.emit('breadcrumbHead');
  }

  getComponents() {
    this.bridge.send('backend-mobx-react:get-observer-components');
  }

  changeSearch(text) {
    const needle = text.toLowerCase();
    if (needle === this.searchText.toLowerCase() && !this.refreshSearch) {
      return;
    }
    if (!text || SearchUtils.trimSearchText(text).length === 0) {
      this.searchRoots = null;
    } else {
      if (
        this.searchRoots &&
        needle.indexOf(this.searchText.toLowerCase()) === 0 &&
        !SearchUtils.shouldSearchUseRegex(text)
      ) {
        this.searchRoots = this.searchRoots.filter((item) => {
          const node = this.nodesById[item];
          return (
            (node.name && node.name.toLowerCase().indexOf(needle) !== -1) ||
            (node.text && node.text.toLowerCase().indexOf(needle) !== -1) ||
            (typeof node.children === 'string' &&
              node.children.toLowerCase().indexOf(needle) !== -1)
          );
        });
      } else {
        this.searchRoots = Object.keys(this.nodesById).filter(key =>
          nodeMatchesText(this.nodesById[key], needle, key, this)
        );
      }
      this.searchRoots.forEach((id) => {
        if (this.hasBottom(id)) {
          this.nodesById[id].collapsed = true;
        }
      });
    }
    this.searchText = text;
    this.emit('searchText');
    this.emit('searchRoots');
    if (this.searchRoots && !this.searchRoots.includes(this.selectedNodeId)) {
      this.select(null, true);
    } else if (!this.searchRoots) {
      if (this.selectedNodeId) {
        this.uncollapseParents(this.selectedNodeId);
      } else {
        this.select(this.roots[0]);
      }
    }

    this.refreshSearch = false;
  }

  hasBottom(id) {
    const node = this.nodesById[id];
    const children = node.children;
    if (typeof children === 'string' || !children || !children.length || node.collapsed) {
      return false;
    }
    return true;
  }

  getParent(id) {
    return this.nodeParentsById[id];
  }

  addRootId(id) {
    if (this.roots.includes(id)) return;
    this.roots.push(id);
    if (!this.selectedNodeId) this.select(id, true);
    this.emit('roots');
  }

  removeRootId(id) {
    const idx = this.roots.indexOf(id);
    if (idx !== -1) {
      this.roots.splice(idx, 1);
      this.emit('roots');
      if (this.selectedNodeId === id) {
        this.selectedNodeId = undefined;
        this.select(undefined);
      }
    }
  }

  addNode(node) {
    node.renders = 1;
    node.collapsed = true;
    this.nodesById[node.id] = node;
    if (node.children) {
      node.children.forEach((childId) => {
        this.removeRootId(childId);
        this.nodeParentsById[childId] = node.id;
      });
    }
    this.emit(node.id);
    if (!this.nodeParentsById[node.id]) {
      this.addRootId(node.id);
    }
  }

  updateNode(data) {
    if (data.children) {
      data.children.forEach((childId) => {
        const ridx = this.roots.indexOf(childId);
        if (ridx !== -1) {
          this.roots.splice(ridx, 1);
          this.emit('roots');
        }
        if (!this.nodeParentsById[childId]) {
          this.nodeParentsById[childId] = data.id;
          const childNode = this.nodesById[childId];
          if (
            this.searchRoots &&
            childNode && // fixme
            nodeMatchesText(childNode, this.searchText.toLowerCase(), childId, this)
          ) {
            this.searchRoots = this.searchRoots.push(childId);
            this.emit('searchRoots');
            this.highlightSearch();
          }
        }
      });
    }
    if (this.nodesById[data.id]) {
      delete data.component; // fixme
      Object.assign(this.nodesById[data.id], data);
      this.emit(data.id);
    } else {
      this.addNode(data);
    }
  }

  removeNode(node) {
    const parentId = this.getParent(node.id);
    delete this.nodesById[node.id];
    delete this.nodeParentsById[node.id];
    if (parentId && this.nodesById[parentId]) {
      const idx = this.nodesById[parentId].children.indexOf(node.id);
      if (idx !== -1) {
        this.nodesById[parentId].children.splice(idx, 1);
        this.emit(parentId);
      }
    } else {
      const idx = this.roots.indexOf(node.id);
      if (idx !== -1) {
        this.roots.splice(idx, 1);
        this.emit('roots');
      }
    }
    if (node.id === this.selectedNodeId) {
      this.selectTop(parentId, true);
    }
  }

  highlight(id) {
    this.bridge.send('highlight', id);
  }

  hideHighlight() {
    this.bridge.send('stop-highlighting');
    if (!this.hoveredNodeId) {
      return;
    }
    const id = this.hoveredNodeId;
    this.hoveredNodeId = null;
    this.emit(id);
    this.emit('hoveredNodeId');
  }

  setHover(id, isHovered, isBottomTag) {
    if (isHovered) {
      const old = this.hoveredNodeId;
      this.hoveredNodeId = id;
      this.isBottomTagHovered = isBottomTag;
      if (old) {
        this.emit(old);
      }
      this.emit(id);
      this.emit('hoveredNodeId');
      this.highlight(id);
    } else if (this.hoveredNodeId === id) {
      this.hideHighlight();
      this.isBottomTagHovered = false;
    }
  }

  selectBreadcrumb(id) {
    this.uncollapseParents(id);
    this.changeSearch('');
    this.isBottomTagSelected = false;
    this.select(id, false, true);
  }

  selectTop(id, noHighlight = false) {
    this.isBottomTagSelected = false;
    this.select(id, noHighlight);
  }

  selectBottom(id) {
    this.isBottomTagSelected =
      !this.nodesById[id].collapsed && this.nodesById[id].children.length > 0;
    this.select(id);
  }

  select(id, noHighlight = false, keepBreadcrumb = false) {
    const oldSel = this.selectedNodeId;
    this.selectedNodeId = id;
    if (oldSel) {
      this.emit(oldSel);
    }
    if (id) {
      this.emit(id);
    }
    if (!keepBreadcrumb) {
      this.breadcrumbHead = id;
      this.emit('breadcrumbHead');
    }
    this.emit('selectedNodeId');
    this.bridge.send('selectedNodeId', id);
    if (this.nodesById[id]) {
      this.bridge.send('getDeptree', { componentId: id, mobxid: this.nodesById[id].mobxid });
      this.inspect(['component']);
    }
    if (!noHighlight && id) {
      this.highlight(id);
    }
  }

  inspect(path) {
    this.bridge.send('inspect-component', { componentId: this.selectedNodeId, path });
  }

  stopInspecting(path) {
    this.bridge.send('stop-inspecting-component', { componentId: this.selectedNodeId, path });
  }

  changeValue({ path, value }) {
    this.bridge.send('change-value', { componentId: this.selectedNodeId, path, value });
  }

  showContextMenu(type, evt, ...args) {
    evt.preventDefault();
    this.contextMenu = {
      x: evt.clientX,
      y: evt.clientY,
      items: this.getContextMenuActions(type, args),
      close: () => {
        this.hideContextMenu();
      },
    };
    this.emit('contextMenu');
  }

  hideContextMenu() {
    this.contextMenu = undefined;
    this.emit('contextMenu');
  }

  pickComponent() {
    this.pickingComponent = true;
    this.emit('pickingComponent');
    this.bridge.send('pick-component');
  }

  stopPickingComponent() {
    this.pickingComponent = false;
    this.emit('pickingComponent');
    this.bridge.send('stop-picking-component');
  }

  collapse(id) {
    if (!this.nodesById[id].collapsed) {
      this.nodesById[id].collapsed = true;
      this.emit(id);
    }
  }

  uncollapse(id) {
    if (this.nodesById[id].collapsed) {
      this.nodesById[id].collapsed = false;
      this.emit(id);
    }
  }

  uncollapseParents(id) {
    if (this.searchRoots && this.searchRoots.includes(id)) {
      return;
    }
    let pid = this.nodeParentsById[id];
    while (pid) {
      this.uncollapse(pid);
      if (this.searchRoots && this.searchRoots.includes(pid)) {
        return;
      }
      pid = this.nodeParentsById[pid];
    }
  }

  getContextMenuActions(type, args) {
    switch (type) {
      case 'tree': {
        const [id, node] = args;
        const items = [];
        if (node.name) {
          items.push({
            key: 'showNodesOfType',
            title: `Show all ${node.name}`,
            action: () => {
              this.changeSearch(node.name);
              this.hideContextMenu();
            },
          });
        }
        items.push({
          key: 'scrollToNode',
          title: 'Scroll to node',
          action: () => {
            this.bridge.send('scrollToNode', { id });
            this.hideContextMenu();
          },
        });
        return items;
      }
      case 'attr': {
        const [id, node, val, path, name] = args; // eslint-disable-line no-unused-vars
        return [
          {
            key: 'storeAsGlobal',
            title: 'Store as global variable',
            action: () => {
              this.bridge.send('makeGlobal', { id, path });
              this.hideContextMenu();
            },
          },
        ];
      }
      default:
        return [];
    }
  }
}
