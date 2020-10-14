/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import { symbols } from '../../Bridge';
import Spinner from '../Spinner';

const renderSparseArrayHole = (count, key) => (
  <li key={key}>
    <div className={css(styles.head)}>
      <div className={css(styles.sparseArrayHole)}>undefined ×{count}</div>
    </div>
  </li>
);

export default class DataView extends React.Component {
  static propTypes = {
    startOpen: PropTypes.bool,
    change: PropTypes.func,
    className: PropTypes.string,
    path: PropTypes.array.isRequired,
    getValueByPath: PropTypes.func,
    inspect: PropTypes.func,
    stopInspecting: PropTypes.func,
    showMenu: PropTypes.func,
    noSort: PropTypes.func,
    hidenKeysRegex: PropTypes.instanceOf(RegExp),
    ChildDataView: PropTypes.func.isRequired,
    ChildDataItem: PropTypes.func.isRequired,
  };

  renderItem(name, key, editable, path) {
    return (
      <this.props.ChildDataItem
        key={key}
        name={name}
        path={path || this.props.path.concat([name])}
        startOpen={this.props.startOpen}
        getValueByPath={this.props.getValueByPath}
        inspect={this.props.inspect}
        stopInspecting={this.props.stopInspecting}
        change={this.props.change}
        showMenu={this.props.showMenu}
        editable={editable}
        ChildDataView={this.props.ChildDataView}
        ChildDataItem={this.props.ChildDataItem}
      />
    );
  }

  render() {
    const value = this.props.getValueByPath(this.props.path);
    if (!value) {
      return <div className={css(styles.missing)}>null</div>;
    }
    const editable = this.props.change && value[symbols.editable] === true;

    const isArray = Array.isArray(value);
    const isDeptreeNode = value[symbols.type] === 'deptreeNode';
    const isMap = value[symbols.type] === 'map';
    const isSet = value[symbols.type] === 'set';
    const elements = [];
    if (isArray) {
      // Iterate over array, filling holes with special items
      let lastIndex = -1;
      value.forEach((item, i) => {
        if (lastIndex < i - 1) {
          // Have we skipped over a hole?
          const holeCount = i - 1 - lastIndex;
          elements.push(renderSparseArrayHole(holeCount, `${i}-hole`));
        }
        elements.push(this.renderItem(i, i, editable));
        lastIndex = i;
      });
      if (lastIndex < value.length - 1) {
        // Is there a hole at the end?
        const holeCount = value.length - 1 - lastIndex;
        elements.push(renderSparseArrayHole(holeCount, `${lastIndex}-hole`));
      }
    } else if (isDeptreeNode) {
      value.dependencies.forEach((node, i) => {
        elements.push(
          <this.props.ChildDataItem
            key={i}
            name={i}
            path={this.props.path.concat(['dependencies', i])}
            startOpen={this.props.startOpen}
            getValueByPath={this.props.getValueByPath}
            inspect={this.props.inspect}
            stopInspecting={this.props.stopInspecting}
            change={this.props.change}
            showMenu={this.props.showMenu}
            editable={editable}
            ChildDataView={this.props.ChildDataView}
            ChildDataItem={this.props.ChildDataItem}
          />,
        );
      });
    } else if (isMap) {
      if (value[symbols.entries]) {
        value[symbols.entries].forEach(([key], i) =>
          elements.push(
            this.renderItem(key, key, editable, this.props.path.concat([symbols.entries, i, 1])),
          ),
        );
      }
    } else if (isSet) {
      if (value[symbols.entries]) {
        value[symbols.entries].forEach(([key], i) =>
          elements.push(
            this.renderItem(key, key, editable, this.props.path.concat([symbols.entries, i, 1])),
          ),
        );
      }
    } else {
      // Iterate over a regular object
      let names = Object.keys(value).filter((n) => n[0] !== '@' || n[1] !== '@');
      if (this.props.hidenKeysRegex) {
        names = names.filter((n) => !this.props.hidenKeysRegex.test(n));
      }
      if (!this.props.noSort) {
        names.sort(alphanumericSort);
      }
      names.forEach((name) => elements.push(this.renderItem(name, name, editable)));
    }

    if (!elements.length) {
      if (value[symbols.inspected] === false) return <Spinner />;
      return (
        <div className={css(styles.empty)}>
          {(() => {
            switch (true) {
              case isArray:
                return 'Empty array';
              case isDeptreeNode:
                return 'No dependencies';
              case isMap:
                return 'Empty map';
              default:
                return 'Empty object';
            }
          })()}
        </div>
      );
    }

    return (
      <ul className={`${css(styles.container)} ${this.props.className}`}>
        {/* {value[symbols.proto] && ( */}
        {/* <this.props.ChildDataItem */}
        {/* key={symbols.proto} */}
        {/* name={symbols.proto} */}
        {/* path={this.props.path.concat([symbols.proto])} */}
        {/* startOpen={this.props.startOpen} */}
        {/* getValueByPath={this.props.getValueByPath} */}
        {/* inspect={this.props.inspect} */}
        {/* stopInspecting={this.props.stopInspecting} */}
        {/* change={this.props.change} */}
        {/* showMenu={this.props.showMenu} */}
        {/* editable={this.props.editable} */}
        {/* ChildDataView={this.props.ChildDataView} */}
        {/* ChildDataItem={this.props.ChildDataItem} */}
        {/* /> */}
        {/* )} */}

        {elements}
      </ul>
    );
  }
}

function alphanumericSort(a, b) {
  if (`${+a}` === a) {
    if (`${+b}` !== b) {
      return -1;
    }
    return +a < +b ? -1 : 1;
  }
  return a < b ? -1 : 1;
}

const styles = StyleSheet.create({
  container: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    marginLeft: '0.75rem',
    fontFamily: 'const(--font-family-monospace)',
    fontSize: 12,
  },

  head: {
    display: 'flex',
    position: 'relative',
  },

  empty: {
    marginLeft: '0.75rem',
    padding: '0 5px',
    color: 'const(--dataview-preview-value-empty)',
    fontStyle: 'italic',
  },

  missing: {
    fontWeight: 'bold',
    marginLeft: '0.75rem',
    padding: '2px 5px',
    color: 'const(--dataview-preview-value-missing)',
  },
});
