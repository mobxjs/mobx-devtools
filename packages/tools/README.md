# Mobx-devtools V0.0.3:
Allows debugging mobx roots, 
## Installation

Using npm:

```
npm i --save @mobx-devtools/tools
```

Use case

````import {StoreA, StoreB} from './stores';
import {injectStores} from '@mobx-devtools/tools';

const storeA = new StoreA();
const storeB = new StoreB();

injectStores({
  storeA,
  storeB
});

const App = () => {
  // other code
}```
````
