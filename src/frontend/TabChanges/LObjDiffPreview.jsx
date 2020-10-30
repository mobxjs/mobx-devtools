import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';

export default class LObjDiffPreview extends React.PureComponent {
  static propTypes = {
    change: PropTypes.object.isRequired,
  };

  getStats() {
    const { change } = this.props;
    switch (change.type) {
      case 'add':
        return { addedCount: 1, removedCount: 0 };
      case 'delete':
        return { addedCount: 0, removedCount: 1 };
      case 'update':
        return { addedCount: 1, removedCount: 1 };
      case 'splice':
        return { addedCount: change.addedCount, removedCount: change.removedCount };
      default:
        return { addedCount: 0, removedCount: 0 };
    }
  }

  render() {
    const { addedCount, removedCount } = this.getStats();
    return (
      <div className={css(styles.container)} >
        {addedCount > 0 && <div className={css(styles.added)}>+{addedCount}</div>}
        {removedCount > 0 && <div className={css(styles.removed)}>−{removedCount}</div>}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'inline-flex',
    padding: '1px 1px 1px 6px',
    cursor: 'pointer',
    opacity: 0.9,
    userSelect: 'none',
    fontSize: 11,
    borderRadius: 3,
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
  added: {
    marginRight: 5,
    color: '#28a745',
    fontWeight: 500,
  },
  removed: {
    marginRight: 5,
    color: '#cb2431',
    fontWeight: 500,
  },
});
