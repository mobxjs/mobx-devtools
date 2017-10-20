export default (bridge, hook) => {
  const snapshotsTrackingEnabled = true;
  const actionsTrackingEnabled = true;
  const patchesTrackingEnabled = true;
  const collections = {};
  const roots = {};

  const addRoot = ({ root, mobxid }) => {
    const { mst } = collections[mobxid] || {};
    if (mst) {
      if (!roots[mobxid]) {
        roots[mobxid] = [];
      }
      if (roots[mobxid].indexOf(root) !== -1) return;
      roots[mobxid].push(root);
      mst.addDisposer(root, () => removeRoot({ root, mobxid }));
      disposables.push(
        mst.onPatch(root, (patch, reversePatch) => {
          if (patchesTrackingEnabled) {
            bridge.send('frontend:append_patches', { ...patch, reversePatch });
          }
        }),
        mst.onAction(root, (action) => {
          if (actionsTrackingEnabled) {
            bridge.send('frontend:append_actions', action);
          }
        }),
        mst.onSnapshot(root, (snapshot) => {
          if (snapshotsTrackingEnabled) {
            bridge.send('frontend:append-snapshots', snapshot);
          }
        })
      );
    }
  };

  const removeRoot = ({ root, mobxid }) => {
    if (roots[mobxid]) {
      const idx = roots[mobxid].indexOf(root);
      if (idx !== -1) roots[mobxid].splice(idx, 1);
    }
  };

  const disposables = [
    hook.sub('mst-root', addRoot),
    hook.sub('mst-root-dispose', removeRoot),
    bridge.sub('backend-mst:set-snapshots-tracking-enabled', () => {}),
    bridge.sub('backend-mst:set-actions-tracking-enabled', () => {}),
    bridge.sub('backend-mst:set-patches-tracking-enabled', () => {}),
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
