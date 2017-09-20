import ObjectAssign from 'es6-object-assign';
import { configureDevtool } from '../shells/react-panel/DevTool';

export { default, configureDevtool } from '../shells/react-panel/DevTool';
export { default as GraphControl } from '../shells/react-panel/Controls/GraphControl';
export { default as LogControl } from '../shells/react-panel/Controls/LogControl';
export { default as UpdatesControl } from '../shells/react-panel/Controls/UpdatesControl';

export const setUpdatesEnabled = updatesEnabled => configureDevtool({ updatesEnabled });
export const setGraphEnabled = graphEnabled => configureDevtool({ graphEnabled });
export const setLogEnabled = logEnabled => configureDevtool({ logEnabled });

ObjectAssign.polyfill();
