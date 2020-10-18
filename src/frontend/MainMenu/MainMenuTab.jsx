import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import { ChangesIcon, TimerIcon, MSTIcon } from './icons';

export default class Tab extends React.PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(['changes', 'performance', 'mst']),
    children: PropTypes.node,
    active: PropTypes.bool,
    processing: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  };

  getIcon() {
    switch (this.props.type) {
      case 'changes':
        return <ChangesIcon />;
      case 'performance':
        return <TimerIcon />;
      case 'mst':
        return <MSTIcon />;
      default:
        return null;
    }
  }

  render() {
    const { children, active, onClick, processing } = this.props;
    return (
      <span
        className={css(styles.tab, active && styles.active, processing && styles.processing)}
        onClick={onClick}
        data-test={`MainMenu-Tab-${this.props.type}`}
      >
        <div className={css(styles.icon)}>{this.getIcon()}</div>
        <span className={css(styles.tabLabel)}> {children}</span>
      </span>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    display: 'flex',
    alignItems: 'center',
    border: '0 none',
    backgroundColor: 'transparent',
    color: '#616161',
    fontSize: 13,
    marginRight: 12,
    padding: '10px 3px',
    cursor: 'default',
    overflow: 'hidden',
  },
  active: {
    boxShadow: 'inset 0 -3px 0 0 var(--primary-color)',
  },
  processing: {
    position: 'relative',
    ':after': {
      content: '""',
      width: 6,
      height: 6,
      backgroundColor: '#ef3217',
      borderRadius: '50%',
      position: 'absolute',
      top: '50%',
      left: 2,
      marginTop: -9,
    },
  },
  icon: {
    flex: '0 0 auto',
    display: 'inline-flex',
    marginRight: 3,
  },
  tabLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none',
  },
});
