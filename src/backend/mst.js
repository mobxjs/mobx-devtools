import getId from '../utils/getId';

const summary = logItem => {
  const sum = Object.create(null);
  const { patches } = logItem;
  sum.patches =
    patches &&
    patches.map(patch => ({
      op: patch.op,
      path: patch.path,
      value: patch.value && typeof patch.value === 'object' ? {} : patch.value,
    }));
  sum.id = logItem.id;
  sum.rootId = logItem.rootId;
  sum.timestamp = logItem.timestamp;
  return sum;
};

export default (bridge, hook) => {
  const collections = {};
  const rootDataById = {};

  let trackingEnabled = false;
  let insideUntracked = false;

  const addLogItem = (rootId, { snapshot, patches }) => {
    const rootData = rootDataById[rootId];
    if (!rootData) return;
    const logItemId = getId();
    const logItem = {
      patches,
      snapshot,
      id: logItemId,
      rootId,
      timestamp: new Date().getTime(),
    };
    rootData.logItemsById[logItemId] = logItem;
    rootData.activeLogItemId = logItemId;
    bridge.send('frontend:append-mst-log-items', summary(logItem));
    bridge.send('frontend:activeLogItemId', { rootId, logItemId });
  };

  const addRoot = ({ root, mobxid, name }) => {
    const { mst } = collections[mobxid] || {};
    if (mst) {
      const rootId = getId(root);
      if (rootDataById[rootId]) return;

      let patches = [];

      const rootDisposables = [
        mst.onPatch(root, patch => {
          if (trackingEnabled && !insideUntracked) {
            patches.push(patch);
          }
        }),
        mst.onSnapshot(root, snapshot => {
          if (trackingEnabled && !insideUntracked) {
            addLogItem(rootId, { snapshot, patches });
            patches = [];
          }
        }),
      ];

      mst.addDisposer(root, () => removeRoot(rootId));

      rootDataById[rootId] = {
        logItemsById: {},
        activeLogItemId: undefined,
        root,
        mobxid,
        dispose: () => rootDisposables.forEach(fn => fn()),
        rootId,
        mst,
        name: name || (root.toString && root.toString()),
      };
    }
  };

  const removeRoot = rootId => {
    const rootData = rootDataById[rootId];
    if (rootData) {
      rootData.dispose();
      delete rootData[rootId];
    }
    bridge.send('frontend:remove-mst-root', rootId);
  };

  const disposables = [
    () => Object.keys(rootDataById).forEach(rootId => removeRoot(rootId)),
    hook.sub('mst-root', addRoot),
    hook.sub('mst-root-dispose', removeRoot),
    bridge.sub('backend-mst:set-tracking-enabled', val => {
      if (val === trackingEnabled) return;
      trackingEnabled = val;
      if (val) {
        bridge.send(
          'frontend:mst-roots',
          Object.keys(rootDataById).map(id => ({
            id,
            name: rootDataById[id].name,
          })),
        );
        Object.keys(rootDataById).forEach(rootId => {
          const rootData = rootDataById[rootId];
          if (Object.keys(rootData.logItemsById).length === 0) {
            addLogItem(rootId, { isInitial: true });
          }
        });
      }
    }),
    bridge.sub('backend-mst:activate-log-item-id', ({ rootId, logItemId }) => {
      const rootData = rootDataById[rootId];
      if (!rootData) return;
      const logItem = rootData.logItemsById[logItemId];
      if (!logItem) return;
      rootData.activeLogItemId = logItemId;
      insideUntracked = true;
      rootData.mst.applySnapshot(rootData.root, logItem.snapshot || {});
      insideUntracked = false;
    }),
    bridge.sub('backend-mst:forget-mst-items', ({ rootId, itemsIds }) => {
      const rootDatum = rootDataById[rootId];
      if (!rootDatum) return;
      itemsIds.forEach(id => {
        delete rootDatum.logItemsById[id];
      });
    }),
    bridge.sub('get-mst-log-item-details', ({ rootId, logItemId }) => {
      const rootDatum = rootDataById[rootId];
      if (!rootDatum) return;
      bridge.send('mst-log-item-details', rootDatum.logItemsById[logItemId]);
    }),
  ];

  return {
    setup(mobxid, collection) {
      collections[mobxid] = collection;
      if (collection.mst) {
        hook.emit('get-mst-roots');
      }
    },
    dispose() {
      disposables.forEach(fn => fn());
    },
  };
};
