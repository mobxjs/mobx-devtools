import AbstractStore from './AbstractStore';

export default class MSTChangesStore extends AbstractStore {
  snapshots = [];
  patches = [];
  actions = [];

  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('frontend:append-snapshots', (snapshot) => {
        if (this.snapshots.length > 500) {
          this.snapshots = this.snapshots.slice(-480);
        }
        this.setValueAndEmit('snapshots', this.snapshots.concat(snapshot));
      }),
      bridge.sub('frontend:append_actions', (action) => {
        if (this.actions.length > 500) {
          this.actions = this.actions.slice(-480);
        }
        this.setValueAndEmit('actions', this.actions.concat(action));
      }),
      bridge.sub('frontend:append_patches', (patch) => {
        this.patches = this.patches.filter(a => a !== 'test');
        if (this.patches.length > 500) {
          this.patches = this.patches.slice(-480);
        }
        this.setValueAndEmit('patches', this.patches.concat(patch));
      })
    );
  }

  toggleSnapshotsTracking(value = !this.snapshotsTrackingEnabled) {
    this.bridge.send('backend-mst:set-snapshots-tracking-enabled', value);
  }
  togglePatchesTracking(value = !this.patchesTrackingEnabled) {
    this.bridge.send('backend-mst:set-patches-tracking-enabled', value);
  }
  toggleActionsTracking(value = !this.actionsTrackingEnabled) {
    this.bridge.send('backend-mst:set-actions-tracking-enabled', value);
  }
}
