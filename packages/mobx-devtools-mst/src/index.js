import * as mobx from 'mobx'; // eslint-disable-line
import * as libmst from 'mobx-state-tree'; // eslint-disable-line

const track = root => {
  const hook = global.__MOBX_DEVTOOLS_GLOBAL_HOOK__; // eslint-disable-line no-underscore-dangle
  if (hook && hook.inject) hook.inject({ mobx, mst: libmst });

  if (!hook) return;
  for (const mobxid in hook.collections) {
    if (Object.prototype.hasOwnProperty.call(hook.collections, mobxid)) {
      const { mst } = hook.collections[mobxid];
      if (mst && mst.isStateTreeNode(root) && mst.isRoot(root)) {
        hook.emit('mst-root', { root, mobxid });
        const disposer = hook.sub('get-mst-roots', () => hook.emit('mst-root', { root, mobxid }));
        mst.addDisposer(root, disposer);
        return;
      }
    }
  }
};

export default function makeInspectable(root) {
  track(root);
  return root;
}
