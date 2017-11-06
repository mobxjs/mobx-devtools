import { observable, action, reaction } from 'mobx';

const root = document.querySelector('#root');
const createButton = (title, onClick) => {
  const wrapper = document.createElement('div');
  const btn = document.createElement('button');
  btn.onclick = onClick;
  btn.innerHTML = title;
  wrapper.appendChild(btn);
  return wrapper;
};

class MyClass {
  @observable count = 0;
  @observable count2 = 0;
  @observable count3 = 0;
}

const observableObject = observable({
  count: 0,
  count2: 0,
  count3: 0,
});

const myClass = new MyClass();

reaction(
  () => myClass.count2,
  (c) => { myClass.count = c; },
  { name: 'My reaction' }
);

reaction(
  () => myClass.count3,
  (c) => { myClass.count2 = c; }
);

const actionIncrement = action(() => { myClass.count += 1; });
const actionIncrement2 = action(() => { myClass.count2 += 1; });
const actionIncrement3 = action(() => { myClass.count3 += 1; });

root.appendChild(createButton('Increment counter (object)', () => {
  observableObject.count += 1;
}));

root.appendChild(createButton('Increment counter (class)', () => {
  myClass.count += 1;
}));

root.appendChild(createButton('actionIncrement', actionIncrement));
root.appendChild(createButton('actionIncrement2', actionIncrement2));
root.appendChild(createButton('actionIncrement3', actionIncrement3));
