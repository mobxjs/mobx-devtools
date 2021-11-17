import React, { useState, useMemo, useCallback } from 'react';
import { css, StyleSheet } from 'aphrodite';
import { FilterAction } from './FilterAction';
import { ListItem } from './ListItem';

export type ActionItem = {
  id: string;
  name: string;
  time: string;
};

export type ActionListProps = {};

export const ActionList = (props: ActionListProps) => {
  const [list, setList] = useState<ActionItem[]>([
    { id: 'test1', name: 'TODOStore.TODOAction1', time: '00:01:03' },
    { id: 'test2', name: 'TODOStore.TODOAction2', time: '00:01:04' },
    { id: 'test3', name: 'TODOStore.TODOAction3', time: '00:01:05' },
    { id: 'test4', name: 'TODOStore.TODOAction4', time: '00:01:06' },
    { id: 'test5', name: 'TODOStore.TODOAction5', time: '00:01:07' },
    { id: 'test6', name: 'TODOStore.TODOAction6', time: '00:01:08' },
    { id: 'test7', name: 'TODOStore.TODOAction7', time: '00:01:09' },
    { id: 'test8', name: 'TODOStore.TODOAction8', time: '00:01:10' },
    { id: 'test9', name: 'TODOStore.TODOAction9', time: '00:01:11' },
    { id: 'test10', name: 'TODOStore.TODOAction10', time: '00:01:12' },
    { id: 'test11', name: 'TODOStore.TODOAction11', time: '00:01:13' },
    { id: 'test12', name: 'TODOStore.TODOAction12', time: '00:01:14' },
  ]);
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const filteredList = useMemo(() => {
    return list.filter(item => !keyword || item.name.includes(keyword));
  }, [keyword, list]);

  const onActionItemSelected = useCallback((id: string) => {
    setSelectedActionId(id);
  }, []);

  return (
    <div className={css(styles.container)}>
      <FilterAction keyword={keyword} setKeyword={setKeyword} />
      <div className={css(styles.actionsContainer)}>
        {filteredList.map(({ id, name, time }) => (
          <ListItem
            key={id}
            id={id}
            name={name}
            time={time}
            selected={selectedActionId === id}
            onSelected={onActionItemSelected}
          />
        ))}
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    width: '100%',
    height: 'calc(100% - 51px)',
    overflow: 'auto'
  },
});
