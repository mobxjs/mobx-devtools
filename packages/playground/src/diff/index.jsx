/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { $mobx } from 'mobx';
import { observer } from 'mobx-react';
import { render } from 'react-dom';
import RootStore from './stores/RootStore';

/**
 * stores = {
 *   storeA: { a: 1 },
 *   storeB: { b: 2}
 * }
 */
const injectStores = stores => {
  // eslint-disable-next-line no-underscore-dangle
  window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__ = {
    stores,
    $mobx,
  };
};

const rootStore = new RootStore();

injectStores({ rootStore });

const App = observer(() => {
  const { testStore } = rootStore;

  const { obj, arr, objAdd, objUpdate, objRemove, arrAdd, arrRemove, arrUpdate } = testStore;

  return (
    <div>
      <div style={{ border: '1px solid #ccc' }}>
        <div>object</div>
        <pre>{JSON.stringify(obj, null, 2)}</pre>
        <button type="button" onClick={() => testStore.objAdd()}>
          objAdd
        </button>
        <button type="button" onClick={() => testStore.objUpdate()}>
          objUpdate
        </button>
        <button type="button" onClick={() => testStore.objRemove()}>
          objRemove
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', marginTop: 8 }}>
        <div>array</div>
        <pre>{JSON.stringify(arr, null, 2)}</pre>
        <button type="button" onClick={() => testStore.arrAdd()}>
          arrAdd
        </button>
        <button type="button" onClick={() => testStore.arrUpdate()}>
          arrUpdate
        </button>
        <button type="button" onClick={() => testStore.arrRemove()}>
          arrRemove
        </button>
      </div>
      <div style={{ border: '1px solid #ccc', marginTop: 8 }}>
        <div>no change</div>
        <button type="button" onClick={() => testStore.noChange()}>
          no change
        </button>
      </div>
    </div>
  );
});

render(<App />, document.querySelector('#root'));
