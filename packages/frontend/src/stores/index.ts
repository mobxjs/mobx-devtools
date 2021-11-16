import ActionsLoggerStore from './ActionsStore';
import CapabilitiesStore from './CapabilitiesStore';
import StoresStore from './StoresStore';

export type AppStores = {
  actionsLoggerStore: ActionsLoggerStore,
  capabilitiesStore: CapabilitiesStore,
  storesStore: StoresStore
}

export const createStores: (bridge?: any) => AppStores = bridge => ({
  actionsLoggerStore: new ActionsLoggerStore(bridge),
  capabilitiesStore: new CapabilitiesStore(bridge),
  storesStore: new StoresStore(bridge)
});
