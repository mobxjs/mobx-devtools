import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import RichPanel from './components/RichPanel/index';

export default (config) => {
  render();

  function render() {
    ReactDOM.render(
      <App
        {...config}
        reload={() => {
          ReactDOM.unmountComponentAtNode(config.node);
          config.node.innerHTML = '';
          render();
        }}
      >
        <RichPanel />
      </App>,
      config.node
    );
  }
}
