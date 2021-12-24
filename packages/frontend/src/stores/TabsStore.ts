import { makeAutoObservable } from 'mobx';
import preferences from './preferences';
import { RootStore } from '.';

export enum TabNames {
  ACTION = 'Action',
  DIFF = 'Diff',
  STATE = 'State',
}

export default class TabsStore {
  rootStore: RootStore;

  selectedTab: TabNames = TabNames.ACTION;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    preferences.get('selectedTab').then(({ selectedTab }: any) => {
      if (typeof selectedTab === 'string') {
        this.setSelectedTab(selectedTab as TabNames)
      } else {
        this.setSelectedTab(TabNames.ACTION);
      }
    });
  }

  setSelectedTab(selectedTab: TabNames) {
    this.selectedTab = selectedTab;
    preferences.set({ selectedTab });
  }
}
