/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { render } from 'react-dom';

const store = observable({ count: 0 });

@observer
class App extends React.Component {
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
