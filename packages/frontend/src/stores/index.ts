import ActionsLoggerStore from './ActionsStore';
import CapabilitiesStore from './CapabilitiesStore';
import StoresStore from './StoresStore';
import TabsStore from './TabsStore';

export class RootStore {
  actionsLoggerStore = new ActionsLoggerStore(this);
  capabilitiesStore = new CapabilitiesStore(this);
  storesStore = new StoresStore(this);
  tabsStore = new TabsStore(this);
}

