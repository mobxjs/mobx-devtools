import * as mobx from 'mobx';
import * as mst from 'mobx-state-tree';

const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;
if (hook && hook.inject) hook.inject({ mobx, mst});

export const inspecableStateTree = (root) => {
  if (!hook) return;
  for (const mobxid in hook.collections) {
    const { mst } = hook.collections[mobxid];
    if (mst && mst.isStateTreeNode(root) && mst.isRoot(root)) {
      hook.emit('mst-root', {root, mobxid});
      const disposer = hook.sub('get-mst-roots', () => hook.emit('mst-root', {root, mobxid}));
      mst.addDisposer(root, disposer);
      return;
    }
  }
  return root
};