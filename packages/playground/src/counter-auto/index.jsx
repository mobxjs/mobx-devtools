/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observable, action, computed, configure } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';

configure({
  enforceActions: 'never',
});

const store = observable({ count: 0 });
const tick = observable({ data: 0 });

class AutoCounter {
  @observable data = 0;

  @computed get computedData() {
    return -this.data;
  }

  @action increase() {
    this.data += 1;
  }
}

const autoCounter = new AutoCounter();
setInterval(() => {
  autoCounter.increase();
}, 2000);

@observer
class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  componentDidMount() {
    this.startTime = new Date();
    this.intervel = setInterval(() => {
      tick.data = Math.floor((+new Date() - +this.startTime) / 1000);
    }, 33);
  }

  componentWillUnmount() {
    clearInterval(this.intervel);
  }

  render() {
    return (
      <div>
        time: {tick.data}s{this.props.children}
      </div>
    );
  }
}

@observer
class Counter extends React.Component {
  manuallyIncrease = action('manuallyIncrease', () => {
    store.count += 1;
  });

  manuallyDecrease = action('manuallyDecrease', () => {
    store.count -= 1;
  });

  render() {
    return (
      <div>
        <div>
          <button onClick={this.manuallyDecrease} type="button">
            –
          </button>
          {store.count}
          <button onClick={this.manuallyIncrease} type="button">
            +
          </button>
        </div>
        <div>{autoCounter.computedData}</div>
      </div>
    );
  }
}

createRoot(document.querySelector('#root')).render(
  <App>
    <Counter />
  </App>,
);
