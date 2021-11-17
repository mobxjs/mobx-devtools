import React, { useEffect } from 'react';
import { css, StyleSheet } from 'aphrodite';
import ReactJson from 'react-json-view';
import { Stores } from './stores/StoresStore';
import injectStores from './utils/injectStores';

export type StoresTreeProps = {
  stores: Stores;
};

const StoresTreeBase = (props: StoresTreeProps) => {
  const { stores } = props;

  return (
    <div className={css(styles.container)}>
      {Object.entries(stores).map(([storeName, store], index) => {
        return (
          <ReactJson
            key={`${storeName}-${index}`}
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
  container: {},
});
