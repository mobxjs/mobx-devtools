/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

const store = observable({ count: 0 });

const App = observer((props) => {
  return (
    <div>
      {props.children}
    </div>
  )
})

App.propTypes = {
  children: PropTypes.node,
}

const Counter = observer(() => {
  const map = new Map([['a', '1'], ['b', 2]]);
  const omap = observable.map({ a: '1', b: 2 });
  const set = new Set([['a', 2]]);
  const oset = observable.set(['a', 2]);
  const date = new Date();
  const array = [1, 2, 3];
  const oarray = observable([1, 2, 3]);
  const obj = { a: 's' };
  const number = 5;
  return (
    <div>
      <button onClick={() => { store.count -= 1; }}>–</button>
      {store.count}
      <button onClick={() => { store.count += 1; }}>+</button>
    </div>
  )
})

render(<App><Counter /></App>, document.querySelector('#root'));
