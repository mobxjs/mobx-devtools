/* eslint-disable */

/**
 * NOTE: This file cannot `require` any other modules. We `.toString()` the
 *       function in some places and inject the source into the page.
 */

export default function installGlobalHook(window) {
  if (window.__MOBX_DEVTOOLS_GLOBAL_HOOK__ && window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.collections) {
    return;
  }

  function valid(a, name) {
    if (!a) return false;
    switch (name) {
      case 'mobx':
        return Boolean(a[name] && a[name].extras && a[name].spy);
      case 'mobxReact':
        return Boolean(a[name] && a[name].componentByNodeRegistery);
      default:
        return Boolean(a[name]);
    }
  }

  function sameMobxId(a, b) {
    for (let name in b)
      if (Object.prototype.hasOwnProperty.call(b, name)) {
        if (!a || !b) continue;
        const aa = a[name];
        const bb = b[name];
        if (!a[name] || !b[name]) continue;
        for (let key in aa) {
          if (
            Object.prototype.hasOwnProperty.call(aa, key) &&
            Object.prototype.hasOwnProperty.call(bb, key) &&
            aa[key] &&
            aa[key] instanceof Object &&
            aa[key] === bb[key]
          ) {
            return true;
          }
        }
        for (let key in bb) {
          if (
            Object.prototype.hasOwnProperty.call(aa, key) &&
            Object.prototype.hasOwnProperty.call(bb, key) &&
            bb[key] &&
            bb[key] instanceof Object &&
            aa[key] === bb[key]
          ) {
            return true;
          }
        }
      }
    return false;
  }

  Object.defineProperty(window, '__MOBX_DEVTOOLS_GLOBAL_HOOK__', {
    value: {
      hookVersion: 1,
      collections: {},
      inject(collection) {
        let mobxid;
        const injectedProps = [];
        for (let id in this.collections)
          if (this.collections.hasOwnProperty(id)) {
            if (sameMobxId(this.collections[id], collection)) {
              mobxid = id;
              break;
            }
          }
        if (!mobxid) {
          mobxid = Math.random()
            .toString(32)
            .slice(2);
          this.collections[mobxid] = {};
        }
        for (let prop in collection)
          if (Object.prototype.hasOwnProperty.call(collection, prop)) {
            if (!this.collections[mobxid][prop] && valid(collection, prop)) {
              this.collections[mobxid][prop] = collection[prop];
              injectedProps.push(prop);
            }
          }
        if (injectedProps.length > 0) this.emit('instances-injected', mobxid);
      },
      injectMobx(mobx) {
        this.inject({ mobx });
      },
      injectMobxReact(mobxReact, mobx) {
        mobxReact.trackComponents();
        this.inject({ mobxReact, mobx });
      },
      _listeners: {},
      sub(evt, fn) {
        this.on(evt, fn);
        return () => this.off(evt, fn);
      },
      on(evt, fn) {
        if (!this._listeners[evt]) {
          this._listeners[evt] = [];
        }
        this._listeners[evt].push(fn);
      },
      off(evt, fn) {
        if (!this._listeners[evt]) {
          return;
        }
        const ix = this._listeners[evt].indexOf(fn);
        if (ix !== -1) {
          this._listeners[evt].splice(ix, 1);
        }
        if (!this._listeners[evt].length) {
          this._listeners[evt] = null;
        }
      },
      emit(evt, data) {
        if (this._listeners[evt]) {
          this._listeners[evt].map(fn => fn(data));
        }
      }
    }
  });
}
