import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { escapeRegExp, debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useStores } from '../contexts/storesProvider';
import { FilterAction } from './FilterAction';
import { FunctionBar } from './FunctionBar';
import { ListItem } from './ListItem';
import { FixedSizeList } from 'react-window';

export type ActionItem = {
  id: string;
  name: string;
  time: string;
};

export const ActionList = observer(() => {
  const { actionsLoggerStore } = useStores();
  const [keyword, setKeyword] = useState<string>('');
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const list = actionsLoggerStore.logItemsIds.map(id => actionsLoggerStore.logItemsById[id]);

  useEffect(() => {
    const handleResize = debounce(() => {
      if (containerRef && containerRef.current) {
        setHeight(containerRef.current.clientHeight - 81);
      }
    }, 500);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredList = useMemo(() => {
    return list
      .filter(item => {
        if (!keyword) return true;

        try {
          const key = actionsLoggerStore.regexEnable ? keyword : escapeRegExp(keyword);
          const regex = actionsLoggerStore.caseEnable ? new RegExp(key) : new RegExp(key, 'i');
          return item.actionName?.match(regex) || item.reactionName?.match(regex);
        } catch (e) {
          return false;
        }
      })
      .filter(item => actionsLoggerStore.logTypes.has(item.type));
  }, [
    keyword,
    list,
    actionsLoggerStore.logTypes,
    actionsLoggerStore.caseEnable,
    actionsLoggerStore.regexEnable,
  ]);

  const onActionItemSelected = useCallback(
    (id: string) => {
      actionsLoggerStore.selectAction(id);
    },
    [actionsLoggerStore],
  );

  const itemData = useMemo(
    () => ({
      list: filteredList,
      onSelected: onActionItemSelected,
      selectedActionId: actionsLoggerStore.selectedActionId,
    }),
    [filteredList, onActionItemSelected, actionsLoggerStore.selectedActionId],
  );

  return (
    <Container ref={containerRef}>
      <FilterAction
        keyword={keyword}
        setKeyword={setKeyword}
        caseEnable={actionsLoggerStore.caseEnable}
        setCaseEnable={actionsLoggerStore.setCaseEnable}
        regexEnable={actionsLoggerStore.regexEnable}
        setRegexEnable={actionsLoggerStore.setRegexEnable}
      />
      <FunctionBar />
      {!!height && (
        <FixedSizeList
          height={height}
          itemCount={filteredList.length}
          itemSize={40}
          itemData={itemData}
          width="100%"
          itemKey={(index: number, data: { list: any[] }) => data.list[index].id}
        >
          {ListItem}
        </FixedSizeList>
      )}
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
