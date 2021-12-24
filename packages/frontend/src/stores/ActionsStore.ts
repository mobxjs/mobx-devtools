import { diff } from 'just-diff';
import { get, setWith } from 'lodash';
import { makeAutoObservable } from 'mobx';
import preferences from './preferences';
import { RootStore } from '.';

type ActionType = 'action' | 'reaction';
const actionsArray: ActionType[] = ['action', 'reaction'];

const PLACEHOLDER = 'placeholder';

const getUpdatedPath = (path, storeName) => {
  let updatedPath: any = [];
  const index = path.findIndex(key => key.toLowerCase() === storeName.toLowerCase());
  if (index !== -1) {
    updatedPath = path.slice(index);
  }

  updatedPath = updatedPath.map(updatedPathItem => String(updatedPathItem));

  return updatedPath;
};

const getDiffData = (prevStores, currentStores, storeName) => {
  const result = diff(prevStores, currentStores);
  const diffData = {};
  result.forEach(({ op, path, value }) => {
    // when storeName is 'TestStore':
    // ['rootStore', 'testStore', 'bar', 1] => ['testStore', 'bar', 1]
    const updatedPath = getUpdatedPath(path, storeName);
    let val: any[];
    switch (op) {
      case 'add': {
        val = [value];
        break;
      }
      case 'replace': {
        const oldValue = get(prevStores, path);
        const newValue = value;
        val = [oldValue, newValue];
        break;
      }
      case 'remove': {
        const value = get(prevStores, path);
        val = [value, PLACEHOLDER, PLACEHOLDER];
        break;
      }
    }
    setWith(diffData, updatedPath, val, Object);
  });
  return diffData;
};

export default class ActionsStore {
  rootStore: RootStore;

  logEnabled = false;

  caseEnable = false;

  regexEnable = false;

  consoleLogEnabled = false;

  logFilter?: string = undefined;

  selectedActionId: string = '';

  logItemsById = {};

  logItemsIds: any[] = [];

  searchText: string = '';

  contextMenu: any = {};

  logTypes: Set<ActionType> = new Set(actionsArray);

  diffById = {};

  get bridge() {
    return this.rootStore.capabilitiesStore.bridge;
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  getPreferences() {
    preferences.get('logEnabled', 'logTypes', 'caseEnable', 'regexEnable').then(({logEnabled, logTypes, caseEnable, regexEnable}: any) => {
      this.toggleLogging(!!logEnabled);
      this.setLogTypes(Array.isArray(logTypes) ? logTypes : actionsArray);
      this.setCaseEnable(!!caseEnable);
      this.setRegexEnable(!!regexEnable);
    });
  }

  subscribe() {
    this.bridge?.sub(
      'appended-log-item',
      ({ change, diffData }) => {
        if (!this.logEnabled) {
          return;
        }
        if (this.logItemsIds.length > 5000) {
          const removedIds = this.logItemsIds.splice(0, this.logItemsIds.length - 4900);
          removedIds.forEach(id => {
            delete this.logItemsById[id];
          });
          this.bridge?.send('remove-log-items', removedIds);
        }

        if (diffData) {
          this.diffById[change.id] = diffData;
        }

        this.logItemsById[change.id] = change;
        this.logItemsIds.push(change.id);
      },
    );
    this.bridge?.sub('log-item-details', item => {
      if (this.logItemsById[item.id]) {
        Object.assign(this.logItemsById[item.id], item);
      }
    });
    this.bridge?.sub('inspect-change-result', ({ changeId, path, data }) => {
      const obj = path.reduce((acc, next) => acc && acc[next], this.logItemsById[changeId]);
      if (obj) {
        Object.assign(obj, data);
      }
      // if (__DEV__) console.log(`inspected--${path.join('/')}`, data);
    });
  }

  inspect(changeId, path) {
    this.bridge?.send('inspect-change', { changeId, path });
  }

  stopInspecting(changeId, path) {
    this.bridge?.send('stop-inspecting-change', { changeId, path });
  }

  toggleLogging(logEnabled = !this.logEnabled) {
    this.bridge?.send('set-log-enabled', logEnabled);
    this.logEnabled = logEnabled;
    preferences.set({ logEnabled });
  }

  toggleConsoleLogging(consoleLogEnabled = !this.consoleLogEnabled) {
    this.bridge?.send('set-console-log-enabled', consoleLogEnabled);
    this.consoleLogEnabled = consoleLogEnabled;
  }

  getDetails(id) {
    this.bridge?.send('get-log-item-details', id);
  }

  clearLog() {
    this.logItemsIds = [];
    this.logItemsById = {};
    this.selectedActionId = '';
    this.bridge?.send('remove-all-log-items');
  }

  setSearchText(text) {
    this.searchText = text;
  }

  setLogFilter(logFilter) {
    this.logFilter = logFilter;
  }

  toggleLogTypes(logType: ActionType) {
    if (this.logTypes.has(logType)) {
      this.logTypes.delete(logType);
    } else {
      this.logTypes.add(logType);
    }
    preferences.set({ logTypes: Array.from(this.logTypes) });
  }

  setLogTypes(logTypes: ActionType[]) {
    this.logTypes = new Set(logTypes);
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
  }

  hideContextMenu() {
    this.contextMenu = undefined;
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
              this.bridge?.send('log:makeGlobal', { changeId, path });
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
    return this.logItemsIds.filter(id => {
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

  selectAction(id: string) {
    this.selectedActionId = id;
  }

  setCaseEnable = (caseEnable: boolean) => {
    this.caseEnable = caseEnable;
    preferences.set({caseEnable});
  }

  setRegexEnable = (regexEnable: boolean) => {
    this.regexEnable = regexEnable;
    preferences.set({regexEnable});
  }
}
