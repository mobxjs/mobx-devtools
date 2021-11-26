import React, { memo } from 'react';
import styled from 'styled-components';
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
    <Container onClick={() => onSelected(id)} selected={selected}>
      <Name selected={selected}>{name}</Name>
      <Time selected={selected}>{time}</Time>
    </Container>
  );
});

const Container = styled.div<{ selected: Boolean }>`
  display: flex;
  width: 100%;
  height: 40px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-family: 'helvetica';
  :not(:first-child) {
    border-top: ${GREY_BORDER} 1px solid;
  }
  ${({ selected }) => (selected ? `background-color: ${PRIMARY_BG_COLOR};` : '')}
`;

const Name = styled.div<{ selected: Boolean }>`
  padding-left: 16px;
  color: ${PRIMARY_FONT_COLOR};
  ${({ selected }) => (selected ? `color: #fff;` : '')}
`;

const Time = styled.div<{ selected: Boolean }>`
  padding-right: 16px;
  color: ${GREY_FONT};
  ${({ selected }) => (selected ? `color: #fff;` : '')}
`;
