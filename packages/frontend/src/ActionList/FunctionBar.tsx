import React from 'react';
import styled from 'styled-components';
import { PRIMARY_FONT_COLOR, OBSERVER_COLOR, GREY_FILL, GREY_BORDER } from '../constant/color';
import ActionsLoggerStore from '../stores/ActionsStore';
import injectStores from '../utils/injectStores';

const ClearLogo = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.503 12.0015C4.503 10.539 4.941 9.183 5.667 8.0295L15.867 18.198C14.6895 19.002 13.3425 19.5 12.0015 19.5C7.866 19.5 4.503 16.137 4.503 12.0015ZM19.5 12.0015C19.5 13.449 18.921 14.904 18 16.1445L7.701 5.877C8.9205 5.0175 10.3995 4.503 12.0015 4.503C16.137 4.503 19.5 7.866 19.5 12.0015ZM12.0015 1.5C6.2115 1.5 1.5 6.2115 1.5 12.0015C1.5 17.7915 6.2115 22.503 12.0015 22.503C17.4 22.503 22.503 17.4 22.503 12.0015C22.503 6.2115 17.7915 1.5 12.0015 1.5Z"
    />
  </svg>
);

export type FunctionBarProps = {
  actionsLoggerStore: ActionsLoggerStore;
};

const FunctionBarBase = (props: FunctionBarProps) => {
  const { actionsLoggerStore } = props;

  return (
    <FunctionBarContainer>
      <ToggleLog
        enable={actionsLoggerStore.logEnabled}
        alt="Stop recording logs"
        onClick={() => actionsLoggerStore.toggleLogging()}
      ></ToggleLog>
      <ClearLog alt="Clear all logs" onClick={() => actionsLoggerStore.clearLog()}>
        {ClearLogo}
      </ClearLog>
      <VerticalDivider />
      <ActionPill
        isActive={actionsLoggerStore.logTypes.has('action')}
        onClick={() => actionsLoggerStore.toggleLogTypes('action')}
      >
        Action
      </ActionPill>
      <ObserverPill
        isActive={actionsLoggerStore.logTypes.has('reaction')}
        onClick={() => actionsLoggerStore.toggleLogTypes('reaction')}
      >
        Observer
      </ObserverPill>
    </FunctionBarContainer>
  );
};

export const FunctionBar = injectStores({
  subscribe: {
    actionsLoggerStore: ['logEnabled', 'log', 'logTypes'],
  },
  // @ts-ignore
  injectProps: ({ actionsLoggerStore }) => ({
    actionsLoggerStore,
  }),
})(FunctionBarBase);

const FunctionBarContainer = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  width: 100%;
  height: 30px;
  padding: 0 16px;
  border-bottom: 1px solid ${GREY_BORDER};

  & > div:not(:first-child) {
    margin-left: 8px;
  }
`;

const ToggleLog = styled.div<{ enable?: boolean }>`
  box-sizing: content-box;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  background-color: ${GREY_FILL};
  cursor: pointer;

  ${({ enable }) =>
    enable
      ? `
  outline: 2px solid rgba(235, 104, 26, 0.2);
  background-color: ${PRIMARY_FONT_COLOR};`
      : ''};
`;

const ClearLog = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;
  svg > path {
    fill: ${GREY_FILL};
  }

  &:hover {
    svg > path {
      fill: #3c3c3c;
    }
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: #cbcdd1;
`;

const ActionPill = styled.div<{ isActive: boolean }>`
  width: auto;
  height: 16px;
  padding: 0 4px;
  border-radius: 3px;
  color: ${GREY_FILL};
  font-size: 12px;
  line-height: 16px;
  font-family: Arial, Helvetica, sans-serif;
  cursor: pointer;

  ${({ isActive }) =>
    isActive
      ? `
   background-color: ${PRIMARY_FONT_COLOR};
   color: #fff;
 `
      : ''}
`;

const ObserverPill = styled(ActionPill)`
  ${({ isActive }) => (isActive ? `background-color: ${OBSERVER_COLOR};` : '')}
`;
