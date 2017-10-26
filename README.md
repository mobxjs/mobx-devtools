# mobx-devtools
This repository is home for:
* [MobX Developer Tools for **Chrome**](https://chrome.google.com/webstore/detail/mobx-developer-tools/pfgnfdagidkfgccljigdamigbcnndkod)
* [MobX Developer Tools for **Firefox**](https://addons.mozilla.org/en-US/firefox/addon/mobx-devtools/)

![MobX DevTools](preview.gif)

#### Features

* Inspect mobx-react observers. Edit values in observable objects
(Doesn't support editing react props/state, use react-devtools for that)
* Track changes in MobX observables
* MST support (see below).

#### mobx-state-tree
To allow inspecting MST root, do `npm install mobx-devtools-mst` and pass it to the function, exported as the default:
```js
import makeInspectable from 'mobx-devtools-mst';

const myStore = MyStore.create(/* ... */);

makeInspectable(myStore);
```
![MobX DevTools MST](preview-mst.png)


# Requirements
* [mobx](https://www.npmjs.com/package/mobx) 3.1.15 or higher;
* (optional) [mobx-react](https://www.npmjs.com/package/mobx-react) 4.2.2 or higher;

Should fail gracefully if using unsupported versions.


# Hacking

Check the [HACKING.md](HACKING.md).
