import AbstractStore from './AbstractStore';

export default class UpdatesHighlighterStore extends AbstractStore {
  updatesEnabled = false;

  updatesFilterByDuration = { slow: false, medium: false, fast: false };

  constructor(bridge) {
    super();
    this.bridge = bridge;
  }

  toggleShowingUpdates(value = !this.updatesEnabled) {
    this.setUpdatesFilterByDuration({ slow: value, medium: value, fast: value });
  }

  setUpdatesFilterByDuration({ slow, medium, fast }) {
    const updatesEnabled = slow || medium || fast;
    this.updatesEnabled = updatesEnabled;
    this.emit('updatesEnabled');
    this.updatesFilterByDuration = { slow, medium, fast };
    this.emit('updatesFilterByDuration');
    this.bridge.send('backend-mobx-react:set-displaying-updates-enabled', updatesEnabled);
    this.bridge.send('backend-mobx-react:set-displaying-updates-filter-by-duration', {
      slow,
      medium,
      fast,
    });
  }
}
