const expect = require('unexpected');
const mobx = require('mobx');

const hadWindow = Object.prototype.hasOwnProperty.call(global, 'window');
const prevWindow = global.window;
if (!hadWindow) {
  global.window = {};
}

const BridgeModule = require('./Bridge');
const makeInspector = require('./backend/utils/inspector').default;

const Bridge = BridgeModule.default;
const { allowedComplexObjects, symbols } = BridgeModule;

describe('Bridge Map and Set serialization', () => {
  after(() => {
    allowedComplexObjects.clear();
    if (!hadWindow) {
      delete global.window;
    } else {
      global.window = prevWindow;
    }
  });

  beforeEach(() => {
    allowedComplexObjects.clear();
  });

  const roundTripThroughBridge = payload => {
    const sent = [];
    const received = [];
    const wall = {
      listen() {},
      send(msg) {
        const cloned = structuredClone(msg);
        sent.push(cloned);
      },
    };
    const backendBridge = new Bridge(wall);
    let clientHandler;
    const frontendBridge = new Bridge({
      listen(fn) {
        clientHandler = fn;
      },
      send() {},
    });
    frontendBridge.sub('inspect', data => received.push(data));

    backendBridge.flushBufferSlice([{ eventName: 'inspect', eventData: payload }]);
    expect(sent, 'to have length', 1);
    clientHandler(sent[0]);
    expect(received, 'to have length', 1);
    return received[0];
  };

  it('serializes inspected ObservableMap entries so postMessage structured clone succeeds', () => {
    class ItemModel {
      x = 1;
    }
    const map = mobx.observable.map({
      item: {
        count: 1,
        handler: () => {},
      },
      model: new ItemModel(),
    });
    allowedComplexObjects.add(map);

    const decoded = roundTripThroughBridge({ data: map });
    const entries = decoded.data[symbols.entries];

    expect(decoded.data[symbols.type], 'to be', 'map');
    expect(decoded.data[symbols.inspected], 'to be', true);
    expect(entries, 'to have length', 2);
    expect(entries[0][0], 'to be', 'item');
    expect(entries[0][1].count, 'to be', 1);
    expect(entries[0][1].handler[symbols.type], 'to be', 'function');
    expect(entries[1][0], 'to be', 'model');
    expect(entries[1][1][symbols.type], 'to be', 'object');
    expect(entries[1][1][symbols.inspected], 'to be', false);
  });

  it('handles self-referential Map and ObservableSet entries without cloning errors', () => {
    const map = new Map();
    map.set('self', map);
    const shared = { label: 'node' };
    const set = mobx.observable.set([shared]);
    allowedComplexObjects.add(map);
    allowedComplexObjects.add(set);

    const decoded = roundTripThroughBridge({ map, set });

    expect(decoded.map[symbols.entries][0][0], 'to be', 'self');
    expect(decoded.map[symbols.entries][0][1], 'to be', decoded.map);
    expect(decoded.set[symbols.type], 'to be', 'set');
    expect(decoded.set[symbols.entries], 'to have length', 1);
    expect(decoded.set[symbols.entries][0][0].label, 'to be', 'node');
    expect(decoded.set[symbols.entries][0][1], 'to be', decoded.set[symbols.entries][0][0]);
  });

  it('resolves nested Map entry paths in inspector', () => {
    const nested = { count: 42 };
    const map = mobx.observable.map({ item: nested });
    const results = [];
    const inspector = makeInspector(res => results.push(res));

    inspector.setInspectedObject({ object: map });
    inspector.inspect(['object']);
    inspector.inspect(['object', symbols.entries, 0, 1]);

    expect(results, 'to have length', 2);
    expect(results[1].data.count, 'to be', 42);
    expect(allowedComplexObjects.has(results[1].data), 'to be', true);
  });
});
