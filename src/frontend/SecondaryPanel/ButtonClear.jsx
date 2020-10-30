import React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { ClearIcon } from './icons';

export default class ButtonClear extends React.PureComponent {
  render() {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div className={css(styles.button)} {...this.props}>
        <ClearIcon />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    flex: '0 0 auto',
    display: 'inline-flex',
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
