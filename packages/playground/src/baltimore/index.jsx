/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

const store = observable({ count: 0 });

@observer
class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return <div>{this.props.children}</div>;
  }
}

@observer
class Counter extends React.Component {
  constructor(...args) {
    super(...args);
    this.map = new Map([
      ['a', '1'],
      ['b', 2],
    ]);
    this.omap = observable.map({ a: '1', b: 2 });
    this.set = new Set([['a', 2]]);
    this.oset = observable.set(['a', 2]);
    this.date = new Date();
    this.array = [1, 2, 3];
    this.oarray = observable([1, 2, 3]);
    this.obj = { a: 's' };
    this.number = 5;
  }

  manuallyIncrease = action('manuallyIncrease', () => {
    store.count += 1;
  });

  manuallyDecrease = action('manuallyDecrease', () => {
    store.count -= 1;
  });

  render() {
    return (
      <div>
        <button onClick={this.manuallyDecrease}>–</button>
        {store.count}
        <button onClick={this.manuallyIncrease}>+</button>
      </div>
    );
  }
}

render(
  <App>
    <Counter />
  </App>,
  document.querySelector('#root'),
);
