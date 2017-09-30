'use strict';


['default', 'configureDevtool'].map((prop) => {
  let warned = false;
  const importLike = prop === 'default' ? 'default' : `{ ${prop} }`;
  Object.defineProperty(module.exports, prop, {
    enumerable: true,
    get: function () {
      if (!warned) {
        warned = true;
        console.warn(
          `[mobx-devtools] Using default export (e.g. import ${importLike} from \'mobx-devtools\' is deprecated. ` +
          `Please use: \`import ${importLike} from 'mobx-devtools/lib/react'\``
        );
      }
      return require('./shells/react')[prop];
    },
  });
});

Object.defineProperty(exports, "__esModule", { value: true });
