['default', 'configureDevtool'].forEach((prop) => {
  let warned = false;
  const importLike = prop === 'default' ? 'default' : `{ ${prop} }`;
  Object.defineProperty(module.exports, prop, {
    enumerable: true,
    get() {
      if (!warned) {
        warned = true;
        console.warn( // eslint-disable-line no-console
          '[mobx-devtools] Using default export ' +
          `(e.g. import ${importLike} from 'mobx-devtools' is deprecated. ` +
          `Please use: \`import ${importLike} from 'mobx-devtools/lib/react'\``
        );
      }
      return require('./shells/react-mini-panel')[prop]; // eslint-disable-line global-require
    },
  });
});

Object.defineProperty(exports, '__esModule', { value: true });
