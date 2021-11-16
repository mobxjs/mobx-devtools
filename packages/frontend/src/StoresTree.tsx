import React, { useEffect } from 'react';
import { css, StyleSheet } from 'aphrodite';
import ReactJson from 'react-json-view';
import injectStores from './utils/injectStores';

export type StoresTreeProps = {};

const StoresTreeBase = (props: StoresTreeProps) => {
  return (
    <div className={css(styles.container)}>
      <ReactJson
        src={{ a: 1, b: 2 }}
        indentWidth={2}
        collapsed={false}
        displayDataTypes={false}
        displayObjectSize={false}
      />
    </div>
  );
};

export const StoresTree = injectStores({
  subscribe: {
    actionsLoggerStore: ['logEnabled', 'log'],
  },
  // @ts-ignore
  injectProps: ({ actionsLoggerStore }) => ({
    searchText: actionsLoggerStore.searchText,
    logEnabled: actionsLoggerStore.logEnabled,
    logItemsIds: actionsLoggerStore.logItemsIds,
    clearLog() {
      actionsLoggerStore.clearLog();
    },
    toggleLogging() {
      actionsLoggerStore.toggleLogging();
    },
    setSearchText(e) {
      actionsLoggerStore.setSearchText(e.target.value);
    },
    shouldUpdated: true,
  }),
})(StoresTreeBase);


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
