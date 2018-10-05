/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

const store = observable({ count: 0 });

@observer
class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

@observer
class Counter extends React.Component {
  constructor(...args) {
    super(...args);
    this.map = new Map([['a', '1'], ['b', 2]]);
    this.omap = observable.map({ a: '1', b: 2 });
    this.date = new Date();
    this.array = [1, 2, 3];
    this.oarray = observable([1, 2, 3]);
    this.obj = { a: 's' };
    this.number = 5;
  }

  render() {
    return (
      <div>
        <button onClick={() => { store.count -= 1; }}>–</button>
        {store.count}
        <button onClick={() => { store.count += 1; }}>+</button>
      </div>
    );
  }
}

render(<App><Counter /></App>, document.querySelector('#root'));
