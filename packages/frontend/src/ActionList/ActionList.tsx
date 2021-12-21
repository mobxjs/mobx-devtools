import React, { useState, useMemo, useCallback } from 'react';
import { escapeRegExp } from 'lodash';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useStores } from '../contexts/storesProvider';
import { FilterAction } from './FilterAction';
import { FunctionBar } from './FunctionBar';
import { ListItem } from './ListItem';

export type ActionItem = {
  id: string;
  name: string;
  time: string;
};

export const ActionList = observer(() => {
  const { actionsLoggerStore } = useStores();
  const [keyword, setKeyword] = useState<string>('');
  const [caseEnable, setCaseEnable] = useState<boolean>(false);
  const [regexEnable, setRegexEnable] = useState<boolean>(false);

  const list = actionsLoggerStore.logItemsIds.map(id => actionsLoggerStore.logItemsById[id]);

  const filteredList = useMemo(() => {
    return list
      .filter(item => {
        if (!keyword) return true;

        try {
          const key = regexEnable ? keyword : escapeRegExp(keyword);
          const regex = caseEnable ? new RegExp(key) : new RegExp(key, 'i');
          return item.actionName?.match(regex) || item.reactionName?.match(regex);
        } catch (e) {
          return false;
        }
      })
      .filter(item => actionsLoggerStore.logTypes.has(item.type));
  }, [keyword, list, actionsLoggerStore.logTypes, caseEnable, regexEnable]);

  const onActionItemSelected = useCallback(
    (id: string) => {
      actionsLoggerStore.selectAction(id);
    },
    [actionsLoggerStore],
  );

  return (
    <Container>
      <FilterAction
        keyword={keyword}
        setKeyword={setKeyword}
        caseEnable={caseEnable}
        setCaseEnable={setCaseEnable}
        regexEnable={regexEnable}
        setRegexEnable={setRegexEnable}
      />
      <FunctionBar />
      <ActionsContainer>
        {filteredList.map(({ id, actionName, reactionName, time, type }) => (
          <ListItem
            key={id}
            id={id}
            type={type}
            name={type === 'action' ? actionName : reactionName}
            time={time}
            selected={actionsLoggerStore.selectedActionId === id}
            onSelected={onActionItemSelected}
          />
        ))}
      </ActionsContainer>
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const ActionsContainer = styled.div`
  width: 100%;
  height: calc(100% - 81px);
  overflow: auto;
`;
