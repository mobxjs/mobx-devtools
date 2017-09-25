/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';

import Loader from '../../../src/frontend/Loader';
import RichPanel from '../../../src/frontend/components/RichPanel';

import debugConnection from '../../../src/debugConnection';

const node = document.getElementById('container');

let onDisconnect;
let loaderConfig;

function render() {
  ReactDOM.render(
    <Loader {...loaderConfig}>
      <RichPanel />
    </Loader>,
    node
  );
}

const whenTabLoaded = (tabId, cb) => {
  chrome.tabs.get(tabId, function(tab) {
    if (tab.status !== 'loading') {
      cb();
      return;
    }
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        cb();
      }
    });
  });
};

chrome.runtime.getBackgroundPage(({ contentTabId }) => {
  loaderConfig = {
    debugName: 'Window UI',
    reload: () => {
      ReactDOM.unmountComponentAtNode(node);
      node.innerHTML = '';
      render();
    },
    reloadSubscribe: reloadFn => {
      onDisconnect = () => reloadFn();
      return () => {
        onDisconnect = undefined;
      };
    },
    inject: done =>
      whenTabLoaded(contentTabId, () => {
        const code = `
          // the prototype stuff is in case document.createElement has been modified
          var script = document.constructor.prototype.createElement.call(document, 'script');
          script.src = "${chrome.runtime.getURL('build/backend.js')}";
          document.documentElement.appendChild(script);
          script.parentNode.removeChild(script);
        `;
        chrome.tabs.executeScript(contentTabId, { code }, () => {
          let disconnected = false;

          const port = chrome.runtime.connect({
            name: `${contentTabId}`
          });

          port.onDisconnect.addListener(() => {
            debugConnection('[background -x FRONTEND]');
            disconnected = true;
            if (onDisconnect) {
              onDisconnect();
            }
          });

          const wall = {
            listen(fn) {
              port.onMessage.addListener(message => {
                debugConnection('[background -> FRONTEND]', message);
                fn(message);
              });
            },
            send(data) {
              if (disconnected) return;
              debugConnection('[FRONTEND -> background]', data);
              port.postMessage(data);
            }
          };
          done(wall, () => port.disconnect());
        });
      })
  };
  render();
});
