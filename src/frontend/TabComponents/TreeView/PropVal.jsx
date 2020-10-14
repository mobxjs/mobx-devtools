import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { css, StyleSheet } from 'aphrodite';

import createFragment from 'react-addons-create-fragment';
import flash from './flash';

import { symbols as consts } from '../../../Bridge';

export default class PropVal extends React.PureComponent {
  static propTypes = {
    val: PropTypes.any,
    nested: PropTypes.bool,
  };

  componentDidUpdate(prevProps) {
    if (this.props.val === prevProps.val) {
      return;
    }
    if (
      this.props.val
      && prevProps.val
      && typeof this.props.val === 'object'
      && typeof prevProps.val === 'object'
    ) {
      return;
    }
    const node = ReactDOM.findDOMNode(this); // eslint-disable-line
    flash(node, '#FFFF00', 'transparent', 1);
  }

  render() {
    return previewProp(this.props.val, !!this.props.nested);
  }
}

function previewProp(val, nested) {
  if (typeof val === 'number') {
    return <span className={css(styles.previewPropNumber)}>{val}</span>;
  }
  if (typeof val === 'string') {
    const finalVal = val.length > 50 ? `${val.slice(0, 50)}…` : val;
    return <span className={css(styles.previewPropString)}>{`"${finalVal}"`}</span>;
  }
  if (typeof val === 'boolean') {
    return <span className={css(styles.previewProp)}>{String(val)}</span>;
  }
  if (Array.isArray(val)) {
    if (nested) {
      return (
        <span className={css(styles.previewPropArray)}>
          [(
          {val.length}
          )]
        </span>
      );
    }
    return previewArray(val);
  }
  if (!val) {
    return <span className={css(styles.previewProp)}>{`${val}`}</span>;
  }
  if (typeof val !== 'object') {
    return <span className={css(styles.previewProp)}>…</span>;
  }

  switch (val[consts.type]) {
    case 'date': {
      return <span className={css(styles.previewProp)}>{val[consts.name]}</span>;
    }
    case 'function': {
      return (
        <span className={css(styles.previewPropFn)}>
          {val[consts.name] || 'fn'}
          ()
        </span>
      );
    }
    case 'object': {
      return <span className={css(styles.previewPropFn)}>{`${val[consts.name]}{…}`}</span>;
    }
    case 'array': {
      return (
        <span className={css(styles.previewPropArray)}>
          Array[
          {val[consts.meta].length}
          ]
        </span>
      );
    }
    case 'typed_array':
    case 'array_buffer':
    case 'data_view': {
      return (
        <span className={css(styles.previewPropArray)}>
          {`${val[consts.name]}[${val[consts.meta]
            .length}]`}
        </span>
      );
    }
    case 'iterator': {
      return <span className={css(styles.previewPropIterator)}>{`${val[consts.name]}(…)`}</span>;
    }
    case 'symbol': {
      // the name is "Symbol(something)"
      return <span className={css(styles.previewPropSymbol)}>{val[consts.name]}</span>;
    }
    default:
      break;
  }

  if (nested) {
    return <span className={css(styles.previewPropNested)}>{'{…}'}</span>;
  }

  return previewObject(val);
}

function previewArray(val) {
  const items = {};
  val.slice(0, 3).forEach((item, i) => {
    items[`n${i}`] = <PropVal val={item} nested />;
    items[`c${i}`] = ', ';
  });
  if (val.length > 3) {
    items.last = '…';
  } else {
    delete items[`c${val.length - 1}`];
  }
  return (
    <span className={css(styles.previewArray)}>
      [
      {createFragment(items)}
      ]
    </span>
  );
}

function previewObject(val) {
  const names = Object.keys(val);
  const items = {};
  names.slice(0, 3).forEach((name, i) => {
    items[`k${i}`] = <span className={css(styles.previewObjectAttr)}>{name}</span>;
    items[`c${i}`] = ': ';
    items[`v${i}`] = <PropVal val={val[name]} nested />;
    items[`m${i}`] = ', ';
  });
  if (names.length > 3) {
    items.rest = '…';
  } else {
    delete items[`m${names.length - 1}`];
  }
  return (
    <span className={css(styles.previewObject)}>
      {'{'}
      {createFragment(items)}
      {'}'}
    </span>
  );
}

const styles = StyleSheet.create({
  previewProp: {
    color: 'var(--treenode-props-value)',
  },
  previewPropNumber: {
    color: 'var(--treenode-props-value-prop-number)',
  },
  previewPropString: {
    color: 'var(--treenode-props-value-prop-string)',
  },
  previewPropArray: {
    color: 'var(--treenode-props-value-prop-array)',
  },
  previewPropNonObject: {
    color: 'var(--treenode-props-value-prop-nonobject)',
  },
  previewPropFn: {
    color: 'var(--treenode-props-value-prop-fn)',
  },
  previewPropIterator: {
    color: 'var(--treenode-props-value-prop-iterator)',
  },
  previewPropSymbol: {
    color: 'var(--treenode-props-value-prop-symbol)',
  },
  previewPropNested: {
    color: 'var(--treenode-props-value-prop-nested)',
  },
  previewArray: {
    color: 'var(--treenode-props-value-array)',
  },
  previewObject: {
    color: 'var(--treenode-props-value-object)',
  },
  previewObjectAttr: {
    color: 'var(--treenode-props-value-object-attr)',
  },
});
