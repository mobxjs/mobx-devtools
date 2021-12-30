import { makeAutoObservable } from 'mobx';
import preferences from './preferences';
import { RootStore } from '.';

type ActionType = 'action' | 'reaction';
const actionsArray: ActionType[] = ['action', 'reaction'];

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
    preferences.get('logEnabled', 'logTypes', 'caseEnable', 'regexEnable').then(({ logEnabled, logTypes, caseEnable, regexEnable }: any) => {
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
  }

  toggleLogging(logEnabled = !this.logEnabled) {
    this.bridge?.send('set-log-enabled', logEnabled);
    this.logEnabled = logEnabled;
    preferences.set({ logEnabled });
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

  hideContextMenu() {
    this.contextMenu = undefined;
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
    preferences.set({ caseEnable });
  }

  setRegexEnable = (regexEnable: boolean) => {
    this.regexEnable = regexEnable;
    preferences.set({ regexEnable });
  }
}
