import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import { StartRecordingArrow } from './icons';

ButtonRecord.propTypes = {
  active: PropTypes.bool,
  showTipStartRecoding: PropTypes.bool,
  onClick: PropTypes.func,
};

export default function ButtonRecord({ active, onClick, showTipStartRecoding }) {
  return (
    <div className={css(styles.button)} onClick={onClick}>
      <span className={css(styles.record, active && styles.recordActive)} />
      {showTipStartRecoding && (
        <div className={css(styles.tipStartRecoding)}>
          <div className={css(styles.tipStartRecodingIcon)}>
            <StartRecordingArrow />
          </div>
          Click to start recording
        </div>
      )}
    </div>
  );
}

const styles = StyleSheet.create({
  button: {
    display: 'inline-block',
    width: 33,
    height: 33,
    position: 'relative',
  },
  record: {
    display: 'block',
    margin: '10px 10px',
    width: 13,
    height: 13,
    borderRadius: '50%',
    backgroundColor: '#6E6E6E',
  },
  recordActive: {
    backgroundColor: '#ef3217',
    boxShadow: '0 0 0 2px rgba(239, 50, 23, 0.35)',
  },
  tipStartRecoding: {
    width: 160,
    boxSizing: 'border-box',
    paddingTop: 9,
    lineHeight: '16px',
    color: '#6e6e6e',
    height: 0,
    position: 'absolute',
    bottom: -5,
    left: 13,
    paddingLeft: 25,
  },
  tipStartRecodingIcon: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.5,
  },
});
