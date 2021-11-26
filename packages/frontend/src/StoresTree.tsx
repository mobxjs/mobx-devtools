import React from 'react';
import ReactJson from 'react-json-view';
import { Stores } from './stores/StoresStore';
import injectStores from './utils/injectStores';

export type StoresTreeProps = {
  stores: Stores;
};

const StoresTreeBase = (props: StoresTreeProps) => {
  const { stores } = props;

  return (
    <div>
      {Object.entries(stores).map(([storeName, store], index) => {
        return (
          <ReactJson
            key={`${storeName}-${index}`}
            name={storeName}
            src={store}
            indentWidth={2}
            collapsed
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            quotesOnKeys={false}
            style={{ fontSize: 14 }}
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
