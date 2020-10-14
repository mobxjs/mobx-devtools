import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import Draggable from '../Draggable';

export default class Player extends React.Component {
  static propTypes = {
    length: PropTypes.number.isRequired,
    currentIndex: PropTypes.number.isRequired,
    onIndexChange: PropTypes.func.isRequired,
  };

  handlePrev = () => {
    this.props.onIndexChange(this.props.currentIndex - 1);
  };

  handleNext = () => {
    this.props.onIndexChange(this.props.currentIndex + 1);
  };

  handleDraggableStart = () => {};

  handleDraggableMove = x => {
    const rect = this.seekBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const targetIndex = Math.round((this.props.length - 1) * percent);
    if (targetIndex !== this.props.currentIndex) {
      this.props.onIndexChange(targetIndex);
    }
  };

  handleDraggableStop = () => {};

  render() {
    const { currentIndex, length } = this.props;
    const percent = length < 2 ? 100 : (currentIndex / (length - 1)) * 100;
    const prevDisabled = currentIndex === 0 || length < 2;
    const nextDisabled = currentIndex === length - 1;
    const disabled = prevDisabled && nextDisabled;
    return (
      <div className={css(styles.player)}>
        <span
          className={css(styles.lrButton, prevDisabled && styles.lrButtonDisabled)}
          onClick={this.handlePrev}
        >
          <IconLeft />
        </span>
        <span className={css(styles.progress)}>
          {currentIndex + 1} / {length}
        </span>
        <span
          className={css(styles.lrButton, nextDisabled && styles.lrButtonDisabled)}
          onClick={this.handleNext}
        >
          <IconRight />
        </span>
        <span
          ref={el => {
            this.seekBar = el;
          }}
          className={css(styles.seekBar, disabled && styles.seekBarDisabled)}
        >
          <span className={css(styles.filledBar)} style={{ width: `${percent}%` }} />
          <Draggable
            onStart={this.handleDraggableStart}
            onMove={this.handleDraggableMove}
            onStop={this.handleDraggableStop}
          >
            <span className={css(styles.handle)} style={{ left: `${percent}%` }} />
          </Draggable>
        </span>
      </div>
    );
  }
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
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    padding: '5px 15px',
    backgroundImage: 'linear-gradient(to top, transparent, rgba(0, 0, 0, 0.05))',
    userSelect: 'none',
    cursor: 'default',
  },
  lrButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    marginRight: 10,
  },
  lrButtonDisabled: {
    pointerEvents: 'none',
    filter: 'grayscale(1)',
    opacity: 0.7,
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
  seekBarDisabled: {
    pointerEvents: 'none',
    filter: 'grayscale(1)',
    opacity: 0.7,
  },
  filledBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: 'var(--primary-color)',
  },
  handle: {
    width: 20,
    height: 20,
    margin: -10,
    position: 'absolute',
    top: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ':after': {
      content: '""',
      width: 12,
      height: 12,
      backgroundColor: 'var(--primary-color)',
      borderRadius: '50%',
    },
    ':hover': {
      ':after': {
        width: 14,
        height: 14,
      },
    },
    ':active': {
      ':after': {
        width: 14,
        height: 14,
      },
    },
  },
});
