import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import pluralize from '../../utils/pluralize';

const getTitle = (logItem, initial) => {
  if (initial) {
    return 'Initial';
  }
  if (logItem.patches) {
    return `${logItem.patches.length} ${pluralize(logItem.patches.length, 'patch', 'patches')}`;
  }
  return 'Change';
};

// const tsToDate = (timestamp) => {
//   const d = new Date(timestamp);
//   const hh = `0${d.getHours()}`.slice(0, 2);
//   const mm = `0${d.getMinutes()}`.slice(0, 2);
//   const ss = `0${d.getSeconds()}`.slice(0, 2);
//   return `${hh}:${mm}:${ss}`;
// };

export default class MstLogItem extends React.PureComponent {
  static propTypes = {
    logItem: PropTypes.object.isRequired,
    active: PropTypes.bool,
    initial: PropTypes.bool,
    selected: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onCommit: PropTypes.func.isRequired,
    style: PropTypes.object,
  };

  handleSelect = () => this.props.onSelect(this.props.logItem.id);

  handleActivate = () => this.props.onActivate(this.props.logItem.id);

  handleCancel = () => this.props.onCancel(this.props.logItem.id);

  handleCommit = () => this.props.onCommit(this.props.logItem.id);

  render() {
    const {
      active, initial, selected, logItem, style,
    } = this.props;
    return (
      <div
        onClick={this.handleSelect}
        className={css(styles.logItem, selected && styles.logItemSelected)}
        style={style}
      >
        <div className={css(styles.title, selected && styles.titleSelected)}>
          {getTitle(logItem, initial)}
        </div>

        <div className={css(styles.rightButtons, selected && styles.rightButtonsSelected)}>
          {!initial
            && (
            <div
              onClick={this.handleCommit}
              className={css(styles.button)}
              title="Commit"
            >
              <CommitIcon />
            </div>
            )}
          {!initial
            && (
            <div
              onClick={this.handleCancel}
              className={css(styles.button)}
              title="Cancel"
            >
              <CancelIcon />
            </div>
            )}
          {!active && (
            <div
              onClick={this.handleActivate}
              className={css(styles.button)}
              title="Time-travel here"
            >
              <TravelIcon />
            </div>
          )}
          {active && (
            <div className={css(styles.activeIndicator)} />
          )}
        </div>
        {active && (
          <div className={css(styles.activeIndicator)} />
        )}
      </div>
    );
  }
}

const TravelIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
  >
    <path fill="none" stroke="var(--log-item-buttons-color)" strokeWidth="1.2" d="M2.188 4.708a6 6 0 1 1 .115 5.792M7.5 7.5V3m0 4.5L10 10" />
    <g fill="var(--log-item-buttons-color)">
      <path d="M.553 3.626L1.5 7.5l2.882-2.757L.553 3.626z" />
      <circle cx="7.5" cy="7.5" r=".75" />
    </g>
  </svg>
);

const CancelIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
  >
    <path fill="none" stroke="var(--log-item-buttons-color)" strokeWidth="1.4" strokeMiterlimit="10" d="M2 13L13 2M13 13L2 2" />
  </svg>
);

const CommitIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
  >
    <path fill="none" stroke="var(--log-item-buttons-color)" strokeMiterlimit="10" d="M7.5 3.143v7.838" />
    <g fill="var(--log-item-buttons-color)">
      <circle cx="7.5" cy="3.256" r="2.256" />
      <path d="M4.708 10.164L7.5 15l2.792-4.836z" />
    </g>
  </svg>
);

const styles = StyleSheet.create({
  logItem: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    fontSize: 12,
    userSelect: 'none',
    cursor: 'default',
    '--log-item-buttons-pane-opacity': '0',
    '--log-item-buttons-color': '#000',
    '--log-item-primary-color': 'var(--primary-color)',
    '--log-item-date-color': 'inherit',
    ':hover': {
      '--log-item-date-color': 'transparent',
      '--log-item-buttons-pane-opacity': '0.95',
    },
    ':not(:last-child)': {
      borderBottom: '1px solid #eee',
    },
  },
  logItemSelected: {
    backgroundColor: 'var(--primary-color)',
    '--log-item-primary-color': '#fff',
    color: '#fff',
    ':hover': {
      '--log-item-buttons-color': '#fff',
    },
  },
  title: {
    padding: 5,
    flex: '1 1 auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    direction: 'rtl',
    unicodeBidi: 'plaintext',
    textOverflow: 'ellipsis',
  },
  titleSelected: {
    filter: 'contrast(0.1) brightness(2)',
  },

  rightButtons: {
    opacity: 'var(--log-item-buttons-pane-opacity)',
    display: 'flex',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(to right, transparent, #fff 10px)',
  },
  rightButtonsSelected: {
    backgroundImage: 'linear-gradient(to right, transparent, var(--primary-color) 10px)',
  },
  button: {
    flex: '0 0 auto',
    width: 35,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    position: 'relative',
    zIndex: 1, // overflow date
    ':hover': {
      opacity: 1,
    },
  },
  activeIndicator: {
    flex: '0 0 auto',
    width: 35,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':after': {
      content: '""',
      width: 8,
      height: 8,
      backgroundColor: 'var(--log-item-primary-color)',
      borderRadius: '50%',
    },
  },
});
