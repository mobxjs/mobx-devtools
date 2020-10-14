import AbstractStore from './AbstractStore';
import preferences from '../../preferences';

export default class ActionsStore extends AbstractStore {
  logEnabled = false;

  consoleLogEnabled = false;

  logFilter = undefined;

  logItemsById = {};

  logItemsIds = [];

  searchText = '';

  constructor(bridge) {
    super();
    this.bridge = bridge;

    this.addDisposer(
      bridge.sub('appended-log-item', (change) => {
        if (this.logItemsIds.length > 5000) {
          const removedIds = this.logItemsIds.splice(0, this.logItemsIds.length - 4900);
          removedIds.forEach((id) => {
            delete this.logItemsById[id];
          });
          this.bridge.send('remove-log-items', removedIds);
        }
        this.logItemsById[change.id] = change;
        this.logItemsIds.push(change.id);
        this.emit('log');
      }),
      bridge.sub('log-item-details', (item) => {
        if (this.logItemsById[item.id]) {
          Object.assign(this.logItemsById[item.id], item);
          this.emit(item.id);
        }
      }),
      bridge.sub('inspect-change-result', ({ changeId, path, data }) => {
        const obj = path.reduce((acc, next) => acc && acc[next], this.logItemsById[changeId]);
        if (obj) {
          Object.assign(obj, data);
        }
        // if (__DEV__) console.log(`inspected--${path.join('/')}`, data);
        this.emit(`inspected--${path.join('/')}`);
      })
    );

    preferences.get('logEnabled').then(({ logEnabled }) => {
      if (logEnabled) this.toggleLogging(true);
    });
  }

  inspect(changeId, path) {
    this.bridge.send('inspect-change', { changeId, path });
  }

  stopInspecting(changeId, path) {
    this.bridge.send('stop-inspecting-change', { changeId, path });
  }

  toggleLogging(logEnabled = !this.logEnabled) {
    preferences.set({ logEnabled });
    this.bridge.send('set-log-enabled', logEnabled);
    this.logEnabled = logEnabled;
    this.emit('logEnabled');
  }

  toggleConsoleLogging(consoleLogEnabled = !this.consoleLogEnabled) {
    this.bridge.send('set-console-log-enabled', consoleLogEnabled);
    this.consoleLogEnabled = consoleLogEnabled;
    this.emit('consoleLogEnabled');
  }

  getDetails(id) {
    this.bridge.send('get-log-item-details', id);
  }

  clearLog() {
    this.logItemsIds = [];
    this.logItemsById = {};
    this.bridge.send('remove-all-log-items');
    this.emit('log');
  }

  setSearchText(text) {
    this.searchText = text;
    this.emit('log');
  }

  setLogFilter(logFilter) {
    this.setValueAndEmit('logFilter', logFilter);
    this.logFilter = logFilter;
    this.emit('logFilter');
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

  getContextMenuActions(type, args) {
    switch (type) {
      case 'attr': {
        const [changeId, path] = args;
        return [
          {
            key: 'storeAsGlobal',
            title: 'Store as global variable',
            action: () => {
              this.bridge.send('log:makeGlobal', { changeId, path });
              this.hideContextMenu();
            },
          },
        ];
      }
      default:
        return [];
    }
  }

  getFilteredLogItemsIds() {
    return this.logItemsIds.filter((id) => {
      const logItem = this.logItemsById[id];
      if (!logItem || !logItem.name) {
        return false;
      }
      if (this.searchText[0] !== '/') {
        // case insensitive
        return logItem.name.toUpperCase().indexOf(this.searchText.toUpperCase()) !== -1;
      }
      try {
        // regex expression may be invalid
        const regex = new RegExp(this.searchText.slice(1), 'i');
        return regex.test(logItem.name);
      } catch (e) {
        return false;
      }
    });
  }
}
