import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Panel } from './Panel';

export default config => {
  const reload = () => {
    ReactDOM.unmountComponentAtNode(config.node);
    setTimeout(() => {
      // for some reason React 16 does unmountComponentAtNode asynchronously (?)
      config.node.innerHTML = '';
      render();
    }, 0);
  };

  const render = () => {
    ReactDOM.render(
      <App {...config} reload={reload}>
        <Panel />
      </App>,
      config.node,
    );
  };

  render();

  return () => ReactDOM.unmountComponentAtNode(config.node);
};
