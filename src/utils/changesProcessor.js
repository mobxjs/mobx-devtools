const getId = (() => {
  let i = 0;
  return () => {
    i += 1;
    return i;
  };
})();

function observableName(mobx, object) {
  if (!object || typeof object !== 'object') {
    return '';
  }
  return mobx.getDebugName(object);
}

function isPrimitive(value) {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function getNameForThis(mobx, who) {
  if (who === null || who === undefined) {
    return '';
  } else if (who && typeof who === 'object') {
    const $mobx = mobx.$mobx || '$mobx';
    if (who && who[$mobx]) {
      return who[$mobx].name;
    } else if (who.constructor) {
      return who.constructor.name || 'object';
    }
  }
  return `${typeof who}`;
}

function formatValue(mobx, value) {
  if (isPrimitive(value)) {
    if (typeof value === 'string' && value.length > 100) {
      return `${value.substr(0, 97)}...`;
    }
    return value;
  }
  return `(${getNameForThis(mobx, value)})`;
}

export default (onChange) => {
  let path = [];

  const push = (_change, mobx) => {
    const change = Object.create(null);
    for (const p in _change) {
      if (Object.prototype.hasOwnProperty.call(_change, p)) {
        change[p] = _change[p];
      }
    }
    change.id = getId();
    change.timestamp = Date.now();
    change.children = [];

    const isGroupStart = change.spyReportStart === true;
    const isGroupEnd = change.spyReportEnd === true;

    if (isGroupEnd) {
      if (path.length === 0) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.warn('groupStart & groupEnd mismatch');
        return;
      }
      const superChange = path[path.length - 1];
      path.splice(path.length - 1);
      superChange.time = change.time;
      change.time = undefined;
      if (path.length === 0) {
        onChange(superChange);
      }
    } else {
      if (path.length > 0) {
        path[path.length - 1].children.push(change);
      }
      if (isGroupStart) {
        path.push(change);
      }
      switch (change.type) {
        case 'action':
          // name, target, arguments, fn
          change.targetName = getNameForThis(mobx, change.target);
          break;
        case 'transaction':
          // name, target
          change.targetName = getNameForThis(mobx, change.target);
          break;
        case 'scheduled-reaction':
          // object
          change.objectName = observableName(mobx, change.object);
          break;
        case 'reaction':
          // object, fn
          change.objectName = observableName(mobx, change.object);
          break;
        case 'compute':
          // object, target, fn
          change.objectName = observableName(mobx, change.object);
          change.targetName = getNameForThis(mobx, change.target);
          break;
        case 'error':
          // message
          if (path.length > 0) {
            onChange(path[0]);
            reset();
          } else {
            onChange(change);
          }
          return; // game over
        case 'update':
          // (array) object, index, newValue, oldValue
          // (map, obbject) object, name, newValue, oldValue
          // (value) object, newValue, oldValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(mobx, change.newValue);
          change.oldValue = formatValue(mobx, change.oldValue);
          break;
        case 'splice':
          change.objectName = observableName(mobx, change.object);
          // (array) object, index, added, removed, addedCount, removedCount
          break;
        case 'add':
          // (map, object) object, name, newValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(mobx, change.newValue);
          break;
        case 'delete':
          // (map) object, name, oldValue
          change.objectName = observableName(mobx, change.object);
          change.oldValue = formatValue(mobx, change.oldValue);
          break;
        case 'create':
          // (value) object, newValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(mobx, change.newValue);
          break;
        default:
          break;
      }

      if (path.length === 0) {
        onChange(change);
      }
    }
  };

  const reset = () => {
    if (path.length > 0) {
      path = [];
    }
  };

  return { push, reset };
};
