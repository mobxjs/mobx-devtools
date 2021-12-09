import { makeAutoObservable } from 'mobx';

let keyIndex = 0;

export default class TestStore {
  rootStore = undefined;

  obj = { foo: 1 };

  arr = [{ bar: 1 }];

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  objAdd = () => {
    this.obj[`foo${keyIndex}`] = 1;
    keyIndex += 1;
  };

  objUpdate = () => {
    this.obj.foo += 1;
  };

  objRemove = () => {
    delete this.obj[`foo${keyIndex - 1}`];
    // this.obj[`foo${keyIndex - 1}`] = undefined;
    keyIndex -= 1;
  };

  arrAdd = () => {
    this.arr.push({ bar: this.arr.length + 1 });
  };

  arrRemove = () => {
    const lastIndex = this.arr.length - 1;
    this.arr.splice(lastIndex, 1);
  };

  arrUpdate = () => {
    const lastIndex = this.arr.length - 1;
    const newBar = this.arr[lastIndex].bar + 1;
    this.arr[lastIndex] = { bar: newBar };
  };

  noChange = () => {

  }  
}
