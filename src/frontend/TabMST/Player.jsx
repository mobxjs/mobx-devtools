import React from 'react';
// import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';

export default function Tab() {
  return (
    <div className={css(styles.player)}>
      <span className={css(styles.lrButton)}>
        <IconLeft />
      </span>
      <span className={css(styles.progress)}>2135 / 93522</span>
      <span className={css(styles.lrButton)}>
        <IconRight />
      </span>
      <span className={css(styles.seekBar)}>
        <span className={css(styles.filledBar)} />
        <span className={css(styles.handle)} />
      </span>
    </div>
  );
}

const IconLeft = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="13"
    viewBox="0 0 12 13"
  >
    <path
      fill="none"
      stroke="#6E6E6E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeMiterlimit="10"
      d="M8.5 1.5l-5 5 5 5"
    />
  </svg>
);

const IconRight = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="13"
    viewBox="0 0 12 13"
  >
    <path
      fill="none"
      stroke="#6E6E6E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeMiterlimit="10"
      d="M3.5 1.5l5 5-5 5"
    />
  </svg>
);

const styles = StyleSheet.create({
  player: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 15px',
  },
  lrButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    marginRight: 10,
  },
  progress: {
    flex: '0 0 auto',
    fontSize: 11,
    marginRight: 10,
    fontWeight: 100,
  },
  seekBar: {
    flex: '1 1 auto',
    height: 2,
    backgroundColor: '#969696',
    position: 'relative',
  },
  filledBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '10%',
    height: 2,
    backgroundColor: 'var(--primary-color)',
  },
  handle: {
    width: 10,
    height: 10,
    margin: -5,
    position: 'absolute',
    top: 1,
    left: '10%',
    backgroundColor: 'var(--primary-color)',
    borderRadius: '50%',
  },
});
