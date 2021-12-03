import React, { memo } from 'react';
import styled from 'styled-components';
import {
  OBSERVER_COLOR,
  PRIMARY_BG_COLOR,
  GREY_FONT,
  GREY_BORDER,
  BLACK_FONT,
} from '../constant/color';

export type ListItemProps = {
  selected: boolean;
  onSelected: (id: string) => void;
  id: string;
  name: string;
  time: string;
  type: string;
};

export const ListItem = memo((props: ListItemProps) => {
  const { selected, onSelected, id, name, time, type } = props;

  return type === 'action' ? (
    <Container onClick={() => onSelected(id)} selected={selected}>
      <Name selected={selected}>
        <ActionLogo selected={selected}>A</ActionLogo>
        {name}
      </Name>
      <Time selected={selected}>{time}</Time>
    </Container>
  ) : (
    <ReactionContainer>
      <Name>
        <ObserverLogo>O</ObserverLogo>
        {name}
      </Name>
      <Time>{time}</Time>
    </ReactionContainer>
  );
});

const Container = styled.div<{ selected?: Boolean }>`
  display: flex;
  width: 100%;
  height: 40px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-family: 'helvetica';
  border-bottom: ${GREY_BORDER} 1px solid;
  ${({ selected }) => (selected ? `background-color: #F4F4F4;` : '')}
`;

const ReactionContainer = styled(Container)`
  cursor: default;
`;
const ItemLogo = styled.span`
  display: inline-block;
  width: 16px;
  height: 14px;
  font-size: 10px;
  line-height: 14px;
  color: #fff;
  margin-right: 8px;
  border-radius: 2px;
  text-align: center;
`;

const ObserverLogo = styled(ItemLogo)`
  background-color: ${OBSERVER_COLOR};
`;

const ActionLogo = styled(ItemLogo)`
  background-color: ${PRIMARY_BG_COLOR};
`;

const Name = styled.div`
  display: flex;
  align-items: center;
  padding-left: 16px;
  color: ${BLACK_FONT};
`;

const Time = styled.div`
  padding-right: 16px;
  color: ${GREY_FONT};
`;
