import React from 'react';
import { Tabs } from './Tabs';
import { css, StyleSheet } from 'aphrodite';

export const Panel = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.actionListContainer)}></div>
      <div className={css(styles.tabsContainer)}>
        <Tabs></Tabs>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
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
