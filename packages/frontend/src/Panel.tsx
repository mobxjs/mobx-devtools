import React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { ActionList } from './ActionList/ActionList';
import { Tabs } from './Tabs';

export const Panel = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.actionListContainer)}>
        <ActionList />
      </div>
      <div className={css(styles.tabsContainer)}>
        <Tabs></Tabs>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    height: '100%',
  },
  actionListContainer: {
    flex: 1,
    borderRight: '1px solid #f4f4f4',
  },
  tabsContainer: {
    flex: 1,
  },
});
