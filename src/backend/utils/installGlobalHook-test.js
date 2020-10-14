const expect = require('unexpected');
const installGlobalHook = require('./installGlobalHook').default;

describe('Global Hook', () => {
  let hook;
  const getCollections = () => Object.keys(hook.collections).map((k) => hook.collections[k]);
  const getCollection = (index) => getCollections()[index];

  beforeEach(() => {
    const namespace = {};
    installGlobalHook(namespace);
    hook = namespace.__MOBX_DEVTOOLS_GLOBAL_HOOK__; // eslint-disable-line no-underscore-dangle
  });

  it('injects collection detecting the same mobxId', () => {
    const instanceA = { a: {} };
    const instanceB = { a: {} };
    const instanceC = { a: {} };
    hook.inject({ instanceA });
    hook.inject({ instanceA, instanceB });
    hook.inject({ instanceB: { ...instanceB }, instanceC });
    expect(getCollections(), 'to have length', 1);
    expect(getCollection(0).instanceA, 'to be', instanceA);
    expect(getCollection(0).instanceB, 'to be', instanceB);
    expect(getCollection(0).instanceC, 'to be', instanceC);
  });

  it('injects collection detecting the different mobxId', () => {
    hook.inject({ instanceA: { a: {} } });
    hook.inject({ instanceA: { a: {} } });
    hook.inject({ instanceB: { a: {} } });
    expect(getCollections(), 'to have length', 3);
  });

  describe('mobxId comparator', () => {
    const foo = {};
    const instanceA = {
      a: 1, b: {}, foo, c: [],
    };
    const instanceAA = { foo, bar: {} };
    const instanceB = { c: {} };

    it('believes that instances, containing at least one equal object are the same', () => {
      hook.inject({ instance: instanceA });
      hook.inject({ instance: instanceAA, instanceB });
      expect(getCollections(), 'to have length', 1);
    });

    it('believes that instances, containing no equal objects are different', () => {
      hook.inject({ instance: { a: 1, b: null } });
      hook.inject({ instance: { a: 1, b: null } });
      expect(getCollections(), 'to have length', 2);
    });

    it('believes that collections, containing at lease one equal instance are the same', () => {
      hook.inject({ a: { p: {} }, instanceA });
      hook.inject({ instanceA: instanceAA, instanceB });
      expect(getCollections(), 'to have length', 1);
    });

    it('believes that collections, containing no equal instances are different', () => {
      hook.inject({ instanceA: { a: 1, b: null } });
      hook.inject({ instanceB: { a: 1, b: null } });
      expect(getCollections(), 'to have length', 2);
    });
  });
});
