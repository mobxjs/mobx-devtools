import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

export default config => {
  console.log(1);
  const reload = () => {
    ReactDOM.unmountComponentAtNode(config.node);
    setTimeout(() => {
      // for some reason React 16 does unmountComponentAtNode asynchronously (?)
      config.node.innerHTML = '';
      render();
    }, 0);
  };

  const render = () => {
    ReactDOM.render(<App {...config} reload={reload}></App>, config.node);
  };

  render();

  return () => ReactDOM.unmountComponentAtNode(config.node);
};
