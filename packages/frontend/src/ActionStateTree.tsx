import React from 'react';
import { observer } from 'mobx-react-lite';
import ReactJson from 'react-json-view';
import styled from 'styled-components';
import { GREY_BORDER } from './constant/color';
import { useStores } from './contexts/storesProvider';

export const ActionStateTree = observer(() => {
  const { actionsLoggerStore } = useStores();
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
});

const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${GREY_BORDER};
  margin: 16px 0;
`;
