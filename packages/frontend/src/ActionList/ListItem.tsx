import React, { memo } from 'react';
import { css, StyleSheet } from 'aphrodite';
import { PRIMARY_FONT_COLOR, PRIMARY_BG_COLOR, GREY_FONT, GREY_BORDER } from '../constant/color';

export type ListItemProps = {
  selected: boolean;
  onSelected: (id: string) => void;
  id: string;
  name: string;
  time: string;
};

export const ListItem = memo((props: ListItemProps) => {
  const { selected, onSelected, id, name, time } = props;

  return (
    <div
      className={css(styles.container, selected && styles.containerSelected)}
      onClick={() => onSelected(id)}
    >
      <div className={css(styles.name, selected && styles.selected)}>{name}</div>
      <div className={css(styles.time, selected && styles.selected)}>{time}</div>
    </div>
  );
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    height: '40px',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'helvetica',

    ':not(:first-child)': {
      borderTop: GREY_BORDER + ' 1px solid',
    },
  },
  containerSelected: {
    backgroundColor: PRIMARY_BG_COLOR,
  },
  selected: {
    color: '#FFF',
  },
  name: {
    paddingLeft: 16,
    color: PRIMARY_FONT_COLOR,
  },
  time: {
    paddingRight: 16,
    color: GREY_FONT,
  },
});
