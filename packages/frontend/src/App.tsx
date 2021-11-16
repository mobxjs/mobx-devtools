import React, { ReactNode, useEffect, useRef } from 'react';
import { css, StyleSheet } from 'aphrodite';

export type AppProps = {
  quiet?: boolean;
  reloadSubscribe: any;
  inject: any;
  reload: any;
};

export const App = (props: AppProps) => {
  const { quiet, reloadSubscribe, inject, reload } = props;

  return <div className={css(styles.app)}>Hello world!</div>;
};

const styles = StyleSheet.create({
  app: {
    width: '100%',
    height: '100%',
    fontSize: 30,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontWeight: 400,
  },
});
