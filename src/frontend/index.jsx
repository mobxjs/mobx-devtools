import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import RichPanel from './RichPanel';

export default (config) => {
  render();

  const reload = () => {
    ReactDOM.unmountComponentAtNode(config.node);
    setTimeout(() => {
      // for some reason React 16 does unmountComponentAtNode asynchronously (?)
      config.node.innerHTML = '';
      render();
    }, 0);
  };

  function render() {
    ReactDOM.render(
      <App
        {...config}
        reload={reload}
      >
        <RichPanel />
      </App>,
      config.node
    );
  }
};
