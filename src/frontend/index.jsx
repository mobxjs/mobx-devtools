import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import RichPanel from './RichPanel';

export default config => {
  const reload = () => {
    console.log('Reloading');
    ReactDOM.unmountComponentAtNode(config.node);
    setTimeout(() => {
      // for some reason React 16 does unmountComponentAtNode asynchronously (?)
      config.node.innerHTML = '';
      render();
    }, 0);
  };

  const render = () => {
    console.log('Rendering');
    ReactDOM.render(
      <App
        {...config} // eslint-disable-line react/jsx-props-no-spreading
        reload={reload} // eslint-disable-line react/jsx-no-bind
      >
        <RichPanel />
      </App>,
      config.node,
    );
  };

  render();

  return () => ReactDOM.unmountComponentAtNode(config.node);
};
