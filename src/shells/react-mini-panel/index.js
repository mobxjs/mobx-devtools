import ObjectAssign from 'es6-object-assign';
import { configureDevtool } from './DevTool';

export { default, configureDevtool } from './DevTool';
export { default as GraphControl } from './Controls/GraphControl';
export { default as LogControl } from './Controls/LogControl';
export { default as UpdatesControl } from './Controls/UpdatesControl';

export const setUpdatesEnabled = updatesEnabled => configureDevtool({ updatesEnabled });
export const setGraphEnabled = graphEnabled => configureDevtool({ graphEnabled });
export const setLogEnabled = logEnabled => configureDevtool({ logEnabled });

ObjectAssign.polyfill();
