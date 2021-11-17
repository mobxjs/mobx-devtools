import React, { useEffect } from 'react';
import { css, StyleSheet } from 'aphrodite';
import ReactJson from 'react-json-view';
import injectStores from './utils/injectStores';
import { Stores } from './stores/StoresStore';

export type StoresTreeProps = {
  stores: Stores;
};

const StoresTreeBase = (props: StoresTreeProps) => {
  const { stores } = props;

  return (
    <div className={css(styles.container)}>
      {Object.entries(stores).map(([storeName, store]) => {
        return (
          <ReactJson
            name={storeName}
            src={store}
            indentWidth={2}
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={false}
          />
        );
      })}
    </div>
  );
};

export const StoresTree = injectStores({
  subscribe: {
    storesStore: ['updateStores'],
  },
  // @ts-ignore
  injectProps: ({ storesStore }) => ({
    stores: storesStore.stores,
  }),
})(StoresTreeBase);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});