/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import ChangeDataViewerPopover from './ChangeDataViewerPopover';
import { changeDisplayName } from './utils';

export default class LObjDiff extends React.PureComponent {
  static propTypes = {
    change: PropTypes.object.isRequired,
    path: PropTypes.array.isRequired,
    getValueByPath: PropTypes.func,
    inspect: PropTypes.func,
    stopInspecting: PropTypes.func,
    showMenu: PropTypes.func,
  };

  getDiff() {
    const { change } = this.props;
    switch (change.type) {
      case 'add':
        return {
          added: [{ name: changeDisplayName(change), value: change.newValue, path: ['newValue'] }],
        };
      case 'delete':
        return {
          removed: [{ name: changeDisplayName(change), value: change.oldValue, path: ['oldValue'] }],
        };
      case 'update':
        return {
          added: [{ name: changeDisplayName(change), value: change.newValue, path: ['newValue'] }],
          removed: [{ name: changeDisplayName(change), value: change.oldValue, path: ['oldValue'] }],
        };
      case 'splice':
        return {
          added: (change.added || []).map((value, i) => ({
            name: change.index + i,
            value,
            path: ['added', i],
          })),
          removed: (change.removed || []).map((value, i) => ({
            name: change.index + i,
            value,
            path: ['removed', i],
          })),
        };
      default:
        return { added: [], removed: [] };
    }
  }

  render() {
    const { added = [], removed = [] } = this.getDiff();
    return (
      <div className={css(styles.container)}>
        <div className={css(styles.innerContainer)}>
          {removed.map(({ name, path }, i) => (
            <div className={css(styles.diffRow, styles.removed)} key={i}>
              <div className={css(styles.propName, styles.propNameRemoved)}>{name}</div>
              <div className={css(styles.propValue, styles.propValueRemoved)}>
                <ChangeDataViewerPopover
                  path={this.props.path.concat(path)}
                  getValueByPath={this.props.getValueByPath}
                  inspect={this.props.inspect}
                  stopInspecting={this.props.stopInspecting}
                  showMenu={this.props.showMenu}
                />
              </div>
            </div>
          ))}
          {added.map(({ name, path }, i) => (
            <div className={css(styles.diffRow, styles.added)} key={i}>
              <div className={css(styles.propName, styles.propNameAdded)}>{name}</div>
              <div className={css(styles.propValue, styles.propValueAdded)}>
                <ChangeDataViewerPopover
                  path={this.props.path.concat(path)}
                  getValueByPath={this.props.getValueByPath}
                  inspect={this.props.inspect}
                  stopInspecting={this.props.stopInspecting}
                  showMenu={this.props.showMenu}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'const(--font-family-monospace)',
    width: '100%',
    maxHeight: 270,
    overflow: 'auto',
  },
  innerContainer: {
    display: 'table',
  },
  title: {},
  diffRow: {
    display: 'table-row',
  },
  propName: {
    display: 'table-cell',
    minWidth: 70,
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: 5,
  },
  propNameRemoved: {
    backgroundColor: 'rgba(245, 0, 30, 0.13)',
  },
  propNameAdded: {
    backgroundColor: 'rgba(0, 246, 54, 0.18)',
  },
  propValue: {
    padding: '5px 5px 5px 20px',
    flex: '1 1 auto',
    display: 'table-cell',
    position: 'relative',
    ':before': {
      position: 'absolute',
      left: 5,
      flex: '0 0 auto',
    },
  },
  propValueRemoved: {
    backgroundColor: 'rgba(245, 0, 30, 0.07)',
    ':before': {
      content: '"-"',
    },
  },
  propValueAdded: {
    backgroundColor: 'rgba(0, 246, 54, 0.09)',
    ':before': {
      content: '"+"',
    },
  },
});
