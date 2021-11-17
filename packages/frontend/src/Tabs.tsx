import React, { useEffect, useState } from 'react';
import { css, StyleSheet } from 'aphrodite';
import classNames from 'classnames';
import { StoresTree } from './StoresTree';
import { PRIMARY_BG_COLOR } from './constant/color';

export const Tabs = () => {
  const [tab, setTab] = useState('Action');

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.header)}>
        <div className={css(styles.title)}>{tab}</div>
        <div className={css(styles.buttons)}>
          <button
            type="button"
            className={classNames(css(styles.button), css(styles.actionButton), {
              [css(styles.selectedButton)]: tab === 'Action',
            })}
            onClick={() => setTab('Action')}
          >
            Action
          </button>
          <button
            type="button"
            className={classNames(css(styles.button), css(styles.stateButton), {
              [css(styles.selectedButton)]: tab === 'State',
            })}
            onClick={() => setTab('State')}
          >
            State
          </button>
        </div>
      </div>

      <div>
        <div
          className={classNames(css(styles.actionBody), {
            [css(styles.hide)]: tab !== 'Action',
          })}
        >
          Action
        </div>
        <div
          className={classNames(css(styles.stateBody), {
            [css(styles.hide)]: tab !== 'State',
          })}
        >
          <StoresTree></StoresTree>
        </div>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    display: 'flex',
    height: 50,
    padding: '0 16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f4f4f4',
  },
  title: {
    fontSize: 18,
  },
  buttons: {},
  button: {
    width: 60,
    height: 30,
    border: '1px solid #f4f4f4',
    color: '#323D4C',
    fontSize: 14,
    cursor: 'pointer',
  },
  actionButton: {
    borderRadius: '2px 0 0 2px',
  },
  stateButton: {
    borderRadius: '0 2px 2px 0',
  },
  selectedButton: {
    background: PRIMARY_BG_COLOR,
    color: '#fff',
  },
  actionBody: {},
  stateBody: {
    padding: 16,
  },
  hide: {
    display: 'none',
  },
});
