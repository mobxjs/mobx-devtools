import React from 'react';
import ReactJson from 'react-json-view';
import styled from 'styled-components';
import { GREY_BORDER } from './constant/color';
import ActionsLoggerStore from './stores/ActionsStore';
import injectStores from './utils/injectStores';

export type ActionStateTreeProps = {
  actionsLoggerStore: ActionsLoggerStore;
};

const ActionStateTreeBase = (props: ActionStateTreeProps) => {
  const { actionsLoggerStore } = props;
  const changes = actionsLoggerStore.logItemsById[actionsLoggerStore.selectedActionId];

  return (
    <>
      <ReactJson
        name="arguments"
        src={changes?.arguments || { message: 'Please select an action!' }}
        indentWidth={2}
        collapsed
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        style={{ fontSize: 14 }}
        quotesOnKeys={false}
      ></ReactJson>

      <StyledDivider />

      <ReactJson
        name={changes?.storeName || 'Tip'}
        src={changes?.storeData || { message: 'Please select an action!' }}
        indentWidth={2}
        collapsed
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        style={{ fontSize: 14 }}
        quotesOnKeys={false}
      />
    </>
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

const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${GREY_BORDER};
  margin: 16px 0;
`;
