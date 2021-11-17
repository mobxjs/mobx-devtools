import React, { memo } from 'react';
import { css, StyleSheet } from 'aphrodite';
import { GREY_BORDER } from '../constant/color';

export type FilterActionProps = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

export const FilterAction = memo((props: FilterActionProps) => {
  const { keyword, setKeyword } = props;

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <div className={css(styles.container)}>
      <input className={css(styles.input)} value={keyword} onChange={onKeywordChange} placeholder="Filter actions" />
    </div>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    borderBottom: GREY_BORDER + ' 1px solid',
  },
  input: {
    boxSizing: 'border-box',
    border: 'none',
    outline: 'none',
    width: '100%',
    height: 50,
    padding: '8px 16px',
    fontSize: 18
  },
});
