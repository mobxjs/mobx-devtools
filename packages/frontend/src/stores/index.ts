import ActionsLoggerStore from './ActionsStore';
import CapabilitiesStore from './CapabilitiesStore';

export const createStores = bridge => ({
  actionsLoggerStore: new ActionsLoggerStore(bridge),
  capabilitiesStore: new CapabilitiesStore(bridge),
});
