import React from 'react';
import { css, StyleSheet } from 'aphrodite';

export default () => <div className={css(styles.spinner)} />;

const styles = StyleSheet.create({
  spinner: {
    borderRadius: '50%',
    width: 22,
    height: 22,
    margin: '10px auto',
    position: 'relative',
    borderTop: '2px solid var(--primary-color)',
    borderRight: '2px solid var(--primary-color)',
    borderBottom: '2px solid transparent',
    borderLeft: '2px solid transparent',
    transform: 'translateZ(0)',
    animationName: [
      {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    ],
    animationDuration: '500ms',
    overflow: 'hidden',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
});
