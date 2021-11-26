import React from 'react';
import ReactJson from 'react-json-view';
import ActionsLoggerStore from './stores/ActionsStore';
import injectStores from './utils/injectStores';

export type ActionStateTreeProps = {
  actionsLoggerStore: ActionsLoggerStore;
};

const ActionStateTreeBase = (props: ActionStateTreeProps) => {
  const { actionsLoggerStore } = props;
  const changes = actionsLoggerStore.logItemsById[actionsLoggerStore.selectedActionId];

  return (
    <ReactJson
      name={changes?.storeName || 'Tip'}
      src={changes?.storeData || {'message': 'Please select an action!'}}
      indentWidth={2}
      collapsed
      displayDataTypes={false}
      displayObjectSize={false}
      enableClipboard={false}
      quotesOnKeys={false}
    />
  );
};

export const ActionStateTree = injectStores({
  subscribe: {
    actionsLoggerStore: ['selectAction'],
  },
  // @ts-ignore
  injectProps: ({ actionsLoggerStore }) => ({
    actionsLoggerStore,
  }),
})(ActionStateTreeBase);
