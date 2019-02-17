import makeChangesProcessor from '../utils/changesProcessor';
import consoleLogChange from './utils/consoleLogChange';
import makeInspector from './utils/inspector';
import storaTempValueInGlobalScope from './utils/storaTempValueInGlobalScope';

const summary = (change) => {
  const sum = Object.create(null);
  sum.summary = true;
  sum.id = change.id;
  sum.type = change.type;
  sum.name = change.name;
  sum.objectName = change.objectName;
  sum.key = change.key;
  sum.oldValue = change.oldValue;
  sum.newValue = change.newValue;
  sum.hasChildren = change.children.length > 0;
  sum.timestamp = change.timestamp;
  sum.addedCount = change.addedCount;
  sum.removedCount = change.removedCount;
  sum.object = change.object;
  return sum;
};

export default (bridge) => {
  let logEnabled = false;
  let consoleLogEnabled = false;
  const logFilter = undefined;

  let itemsById = {};

  const inspector = makeInspector(({ inspectedObject, path, data }) => {
    bridge.send('inspect-change-result', { changeId: inspectedObject.id, path, data });
  });

  const changesProcessor = makeChangesProcessor((change) => {
    if (logFilter) {
      try {
        const accept = logFilter(change);
        if (!accept) return;
      } catch (e) {
        console.warn('Error while evaluating logFilter:', e); // eslint-disable-line no-console
      }
    }
    if (logEnabled) {
      if (change) {
        itemsById[change.id] = change;
        bridge.send('appended-log-item', summary(change));
      }
    }
    if (consoleLogEnabled) {
      consoleLogChange(change);
    }
  });

  const disposables = [
    bridge.sub('set-log-enabled', (value) => {
      logEnabled = value;
      bridge.send('log-enabled', value);
      if (!logEnabled && !consoleLogEnabled) changesProcessor.reset();
    }),
    bridge.sub('set-console-log-enabled', (value) => {
      consoleLogEnabled = value;
      bridge.send('console-log-enabled', value);
      if (!logEnabled && !consoleLogEnabled) changesProcessor.reset();
    }),
    bridge.sub('get-log-item-details', (id) => {
      bridge.send('log-item-details', itemsById[id]);
      return itemsById[id];
    }),
    bridge.sub('remove-log-items', (ids) => {
      ids.forEach((id) => {
        delete itemsById[id];
      });
    }),
    bridge.sub('remove-all-log-items', () => {
      itemsById = {};
    }),
    bridge.sub('inspect-change', ({ changeId, path }) => {
      if (!inspector.inspectedObject || changeId !== inspector.inspectedObject.id) {
        inspector.setInspectedObject(itemsById[changeId]);
      }
      inspector.inspect(path);
    }),
    bridge.sub('stop-inspecting-change', ({ changeId, path }) => {
      if (inspector.inspectedObject && changeId === inspector.inspectedObject.id) {
        inspector.forget(path);
      }
    }),
    bridge.sub('log:makeGlobal', ({ changeId, path }) => {
      const change = itemsById[changeId];
      const value = path.reduce((acc, next) => acc && acc[next], change);
      storaTempValueInGlobalScope(value);
    }),
  ];

  return {
    setup(mobxid, collection) {
      if (collection.mobx) {
        disposables.push(
          collection.mobx.spy((change) => {
            if (logEnabled || consoleLogEnabled) {
              changesProcessor.push(change, collection.mobx);
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
