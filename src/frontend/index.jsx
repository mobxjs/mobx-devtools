import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import RichPanel from './RichPanel';

export default config => {
  let root = createRoot(config.node);

  const reload = () => {
    root.unmount();
    setTimeout(() => {
      config.node.innerHTML = '';
      root = createRoot(config.node);
      render();
    }, 0);
  };

  const render = () => {
    root.render(
      <App
        {...config} // eslint-disable-line react/jsx-props-no-spreading
        reload={reload} // eslint-disable-line react/jsx-no-bind
      >
        <RichPanel />
      </App>,
    );
  };

  render();

  return () => root.unmount();
};
