import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import ActionsLoggerStore from '../stores/ActionsStore';
import injectStores from '../utils/injectStores';
import { FilterAction } from './FilterAction';
import { ListItem } from './ListItem';

export type ActionItem = {
  id: string;
  name: string;
  time: string;
};

export type ActionListProps = {
  actionsLoggerStore: ActionsLoggerStore;
};

const ActionListBase = (props: ActionListProps) => {
  const { actionsLoggerStore } = props;
  const [keyword, setKeyword] = useState<string>('');

  const list = actionsLoggerStore.logItemsIds.map(id => actionsLoggerStore.logItemsById[id]);

  const filteredList = useMemo(() => {
    return list.filter(item => !keyword || item.name.includes(keyword));
  }, [keyword, list]);

  const onActionItemSelected = useCallback((id: string) => {
    actionsLoggerStore.selectAction(id);
  }, []);

  return (
    <Container>
      <FilterAction keyword={keyword} setKeyword={setKeyword} />
      <ActionsContainer>
        {filteredList.map(({ id, storeName, actionName, time }) => (
          <ListItem
            key={id}
            id={id}
            name={storeName + '.' + actionName}
            time={time}
            selected={actionsLoggerStore.selectedActionId === id}
            onSelected={onActionItemSelected}
          />
        ))}
      </ActionsContainer>
    </Container>
  );
};

export const ActionList = injectStores({
  subscribe: {
    actionsLoggerStore: ['log', 'selectAction'],
  },
  // @ts-ignore
  injectProps: ({ actionsLoggerStore }) => ({
    actionsLoggerStore,
  }),
})(ActionListBase);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const ActionsContainer = styled.div`
  width: 100%;
  height: calc(100% - 51px);
  overflow: auto;
`;
