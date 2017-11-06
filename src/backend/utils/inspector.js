import { symbols, allowedComplexObjects } from '../../Bridge';

export default (onResult) => {
  let inspectedObject;
  const inspectionTree = {};
  const nodesByObject = new Map();
  const invalidatedNodes = new Set();
  let flushScheduled;
  const PATH = Symbol('PATH');
  const PARENT = Symbol('PARENT');
  const KEY = Symbol('KEY');

  const getNodeForPath = path => path.reduce((acc, next) => {
    if (!acc[next]) {
      acc[next] = { [KEY]: next, [PARENT]: acc, [PATH]: (acc[PATH] || []).concat(next) };
    }
    return acc[next];
  }, inspectionTree);

  const getInvalidatedParentForNode = (node) => {
    let current = node[PARENT];
    while (current) {
      if (invalidatedNodes.has(current)) return true;
      current = current[PARENT];
    }
    return false;
  };

  const getPathsForObject = object => (nodesByObject.get(object) || []).map(node => node[PATH]);

  const getObjectForPath = path => path.reduce(
    (acc, next) => acc && acc[next === symbols.proto ? '__proto__' : next],
    inspectedObject
  );

  const rememberPath = (path, object) => {
    const node = getNodeForPath(path);
    const currentNodes = nodesByObject.get(object) || [];
    if (!currentNodes.includes(node)) {
      nodesByObject.set(object, currentNodes.concat(node));
    }
  };

  const forgetPath = (path) => {
    if (path.length === 0) {
      for (const p in inspectionTree) {
        if (Object.prototype.hasOwnProperty.call(inspectionTree, p)) {
          delete inspectionTree[p];
        }
      }
      nodesByObject.clear();
      invalidatedNodes.clear();
      clearTimeout(flushScheduled);
      return;
    }

    const node = getNodeForPath(path);
    if (node) {
      for (const p in node) {
        if (Object.prototype.hasOwnProperty.call(node, p)) {
          forgetPath(path.concat(p));
        }
      }
      const obj = getObjectForPath(path);
      if (obj) {
        const nodes = nodesByObject.get(obj) || [];
        const idx = nodes.indexOf(node);
        if (idx !== -1) {
          nodes.splice(idx, 1);
          if (nodes.length === 0) nodesByObject.delete(obj);
        }
      }
      delete node[PARENT][node[KEY]];
    }
  };

  const allowChildren = (node) => {
    for (const p in node) {
      if (Object.prototype.hasOwnProperty.call(node, p)) {
        const obj = getObjectForPath(node[p][PATH]);
        if (obj && typeof obj === 'object') allowedComplexObjects.add(obj);
        allowChildren(node[p]);
      }
    }
  };

  const flush = () => {
    if (invalidatedNodes.length === 0) return;
    invalidatedNodes.forEach((node) => {
      const invalidatedParent = getInvalidatedParentForNode(node);
      if (invalidatedParent) {
        invalidatedNodes.delete(node);
      }
    });
    invalidatedNodes.forEach((node) => {
      allowChildren(node);
      fireResult(node[PATH], getObjectForPath(node[PATH]));
    });
    invalidatedNodes.clear();
  };

  const scheduleFlush = () => {
    if (flushScheduled) return;
    Promise.resolve().then(flush); // trailing flush in microtask
    flushScheduled = setTimeout(() => {
      flushScheduled = undefined;
      flush();
    }, 500);
  };

  const fireResult = (path, data) => {
    if (data && typeof data === 'object') {
      allowedComplexObjects.add(data);
    }
    onResult({ inspectedObject, data, path });
  };

  return {
    handleUpdate(object) {
      getPathsForObject(object).forEach((path) => {
        const node = path.reduce((acc, next) => {
          if (!acc[next]) {
            acc[next] = {};
          }
          return acc[next];
        }, inspectionTree);
        invalidatedNodes.add(node);
        scheduleFlush();
      });
    },
    inspect(path) {
      if (inspectedObject) {
        const data = getObjectForPath(path);
        const node = getNodeForPath(path);
        rememberPath(path, data);
        allowChildren(node);
        fireResult(path, data);
      }
    },
    forget(path) {
      forgetPath(path);
    },
    setInspectedObject(obj) {
      if (!obj) {
        forgetPath([]);
      }
      inspectedObject = obj;
    },
    get inspectedObject() {
      return inspectedObject;
    },
  };
};
