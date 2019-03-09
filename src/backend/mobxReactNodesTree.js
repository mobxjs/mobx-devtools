import getId from '../utils/getId';
import getDependencyTree from '../utils/getDependencyTree';
import { hightlight, stopHighlightingAll } from './utils/highlight';
import domNodePicker from './utils/domNodePicker';
import makeInspector from './utils/inspector';
import storaTempValueInGlobalScope from './utils/storaTempValueInGlobalScope';
import { symbols } from '../Bridge';

export default (bridge) => {
  const collections = {};

  const mobxIdsByComponent = new WeakMap();
  const componentsById = {};
  const parentComponentsById = {};
  const nodesById = {};
  let isTracking = false;
  let pickingComponentDisposer;

  const inspector = makeInspector(({ inspectedObject, path, data }) => {
    bridge.send('inspect-component-result', { componentId: inspectedObject.id, path, data });
  });

  const getComponentForNode = (node) => {
    for (const mobxid in collections) {
      if (Object.prototype.hasOwnProperty.call(collections, mobxid)) {
        const { mobxReact } = collections[mobxid];
        let component = mobxReact && mobxReact.componentByNodeRegistery.get(node);
        if (component) {
          component = Object.assign({
            props: component.props,
            state: component.state,
          }, component);
          mobxIdsByComponent.set(component, mobxid);
          return component;
        }
      }
    }
    return undefined;
  };

  const addChild = (parentId, id) => {
    if (!componentsById[parentId]) return;
    if (componentsById[parentId].children.includes(id)) return;
    componentsById[parentId].children.push(id);
    parentComponentsById[id] = parentId;
    if (isTracking) {
      bridge.send('frontend:mobx-react-component-updated', componentsById[parentId]);
    }
  };

  const removeChild = (parentId, id) => {
    if (!componentsById[parentId]) return;
    const idx = componentsById[parentId].children.indexOf(id);
    delete parentComponentsById[id];
    if (idx !== -1) {
      componentsById[parentId].children.splice(idx, 1);
      if (isTracking) {
        bridge.send('frontend:mobx-react-component-updated', componentsById[parentId]);
      }
    }
  };

  const getComponentName = function getComponentName(node) {
    if (node.constructor.displayName) {
      return node.constructor.displayName;
    } else if (node.constructor.name) {
      return node.constructor.name;
    }
    return 'div';
  };

  const trackComponent = (component, node) => {
    const id = getId(component);
    nodesById[id] = node;
    const newAdded = id in componentsById === false;
    if (newAdded) {
      const componentInfo = {
        id,
        component,
        mobxid: mobxIdsByComponent.get(component),
        children: [],
        name: getComponentName(component),
        renders: 0,
        props: component.props,
        state: component.state,
        context: component.context,
      };
      componentsById[id] = componentInfo;
      if (isTracking) {
        if (newAdded) {
          bridge.send('frontend:mobx-react-component-added', componentInfo);
        }
      }
    } else {
      const componentInfo = componentsById[id];
      componentInfo.renders += 1;
      if (inspector.inspectedObject && id === inspector.inspectedObject.id) {
        inspector.inspect([]);
      } else {
        bridge.send('frontend:mobx-react-component-updated', componentInfo);
      }
    }
    return id;
  };

  const traverse = (node, parentComponentId) => {
    const component = getComponentForNode(node);
    let finalParentComponentId = parentComponentId;
    if (component) {
      const id = trackComponent(component, node);
      if (parentComponentId) {
        addChild(parentComponentId, id);
      }
      finalParentComponentId = id;
    }
    for (let i = 0; i < node.childNodes.length; i += 1) {
      traverse(node.childNodes[i], finalParentComponentId);
    }
  };

  const findParent = (node, mobxId) => {
    let current = node.parentElement;
    while (current) {
      if (!collections[mobxId]) return undefined;
      const component = collections[mobxId].mobxReact.componentByNodeRegistery.get(current);
      if (component) {
        mobxIdsByComponent.set(component, mobxId);
        const id = getId(component);
        if (!nodesById[id]) trackComponent(component, current);
        return id;
      }
      current = current.parentElement;
    }
    return undefined;
  };

  const onRender = ({ component, node }, mobxid) => {
    mobxIdsByComponent.set(component, mobxid);
    const id = trackComponent(component, node);
    const parentId = findParent(node, mobxid);
    if (parentId && !componentsById[parentId].children.includes(id)) {
      addChild(parentId, id);
    }
  };

  const onDestroy = ({ component }, mobxid) => {
    mobxIdsByComponent.delete(component, mobxid);
    const componentInfo = componentsById[getId(component)];
    if (componentInfo) {
      const parentId = parentComponentsById[componentInfo.id];
      if (parentId) removeChild(parentId, componentInfo.id);
      delete nodesById[componentInfo.id];
      delete componentsById[componentInfo.id];
      delete parentComponentsById[componentInfo.id];
      bridge.send('frontend:mobx-react-component-removed', componentInfo);
    }
  };

  const disposables = [
    bridge.sub('backend-mobx-react:get-observer-components', () => {
      if (isTracking) {
        bridge.send(
          'frontend:mobx-react-components',
          Object.keys(componentsById).map(id => componentsById[id])
        );
      }
      traverse(document);
      bridge.send(
        'frontend:mobx-react-components',
        Object.keys(componentsById).map(id => componentsById[id])
      );
      isTracking = true;
    }),
    bridge.sub('highlight', (id) => {
      stopHighlightingAll();
      hightlight(nodesById[id], { backgroundColor: 'rgba(0, 144, 255, 0.35)' });
    }),
    bridge.sub('stop-highlighting', stopHighlightingAll),
    bridge.sub('getDeptree', ({ componentId }) => {
      const componentInfo = componentsById[componentId];
      if (!componentInfo) return;
      const $mobx = collections[componentInfo.mobxid].mobx.$mobx || '$mobx';
      componentInfo.dependencyTree = getDependencyTree(componentInfo.component.render[$mobx]);
      bridge.send('frontend:mobx-react-component-updated', componentInfo);
    }),
    bridge.sub('inspect-component', ({ componentId, path }) => {
      if (!inspector.inspectedObject || componentId !== inspector.inspectedObject.id) {
        inspector.setInspectedObject(componentsById[componentId]);
      }
      inspector.inspect(path);
    }),
    bridge.sub('stop-inspecting-component', ({ componentId, path }) => {
      if (inspector.inspectedObject && componentId === inspector.inspectedObject.id) {
        inspector.forget(path);
      }
    }),
    bridge.sub('pick-component', () => {
      if (!pickingComponentDisposer) {
        pickingComponentDisposer = domNodePicker(collections, (component, mobxId) => {
          bridge.send('picked-component', { componentId: getId(component), mobxId });
          pickingComponentDisposer();
          pickingComponentDisposer = undefined;
        });
      }
    }),
    bridge.sub('stop-picking-component', () => {
      if (pickingComponentDisposer) {
        pickingComponentDisposer();
        pickingComponentDisposer = undefined;
      }
    }),
    bridge.sub('makeGlobal', ({ id, path }) => {
      const componentInfo = componentsById[id];
      const value = path.reduce((acc, next) => acc && acc[next], componentInfo);
      storaTempValueInGlobalScope(value);
    }),
    bridge.sub('selectedNodeId', (id) => {
      const componentInfo = componentsById[id];
      window.$m = componentInfo && componentInfo.component;
    }),
    bridge.sub('scrollToNode', ({ id }) => {
      const node = nodesById[id];
      if (!node) {
        return;
      }
      node.scrollIntoView();
      setTimeout(() => hightlight(node, { backgroundColor: 'rgba(0, 144, 255, 0.35)' }), 0);
      setTimeout(stopHighlightingAll, 100);
      setTimeout(() => hightlight(node, { backgroundColor: 'rgba(0, 144, 255, 0.35)' }), 200);
      setTimeout(stopHighlightingAll, 300);
    }),
    bridge.sub('change-value', ({ componentId, path, value }) => {
      const componentInfo = componentsById[componentId];
      let data = path.slice(0, -1).reduce((acc, next) => acc && acc[next], componentInfo);
      const lastComponent = path.slice(-1)[0];
      if (!data || !lastComponent) {
        return;
      }
      if (data[symbols.type] === 'deptreeNode') {
        data = data.node;
      }
      data[lastComponent] = value;
      if (inspector.inspectedObject && componentId === inspector.inspectedObject.id) {
        inspector.inspect(path.slice(0, -1));
      }
    }),
  ];

  return {
    setup(mobxid, collection) {
      collections[mobxid] = collection;
      if (collection.mobxReact) {
        collection.mobxReact.trackComponents();
        disposables.push(
          collection.mobx.spy((report) => {
            inspector.handleUpdate(report.object);
          }),
          collection.mobxReact.renderReporter.on((report) => {
            if (isTracking) {
              switch (report.event) {
                case 'destroy':
                  onDestroy(report, mobxid);
                  break;
                case 'render':
                  // timeout to let the dom render
                  if (report.node) setTimeout(() => onRender(report, mobxid), 16);
                  break;
                default:
                  break;
              }
            }
          })
        );
      }
    },
    dispose() {
      disposables.forEach(fn => fn());
    },
  };
};
