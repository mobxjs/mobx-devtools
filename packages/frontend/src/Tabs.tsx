import React, { useState } from 'react';
import styled from 'styled-components';
import { ActionStateTree } from './ActionStateTree';
import { StoresTree } from './StoresTree';
import { PRIMARY_BG_COLOR } from './constant/color';

export const Tabs = () => {
  const [tab, setTab] = useState('Action');

  return (
    <Container>
      <Header>
        <Title>{tab}</Title>
        <div>
          <ActionButton onClick={() => setTab('Action')} selected={tab === 'Action'}>
            Action
          </ActionButton>
          <StateButton onClick={() => setTab('State')} selected={tab === 'State'}>
            State
          </StateButton>
        </div>
      </Header>

      <Body>
        <TreeContainer hide={tab !== 'Action'}>
          <ActionStateTree />
        </TreeContainer>
        <StoresTreeContainer hide={tab !== 'State'}>
          <StoresTree></StoresTree>
        </StoresTreeContainer>
      </Body>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  height: 50px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f4f4f4;
`;

const Body = styled.div`
  flex: 1;
  overflow: auto;
`;

const Title = styled.div`
  font-size: 18;
`;

const Button = styled.button<{ selected: Boolean }>`
  width: 60px;
  height: 30px;
  border: 1px solid #f4f4f4;
  color: #323d4c;
  font-size: 14px;
  cursor: pointer;
  ${({ selected }) =>
    selected
      ? `
    background: ${PRIMARY_BG_COLOR};
    color:#fff;
    `
      : ''}
`;

const ActionButton = styled(Button)`
  border-radius: 2px 0 0 2px;
`;

const StateButton = styled(Button)`
  border-radius: 0 2px 2px 0;
`;

const TreeContainer = styled.div<{ hide: Boolean }>`
  height: 100%;
  padding: 16px;
  ${({ hide }) => (hide ? `display: none;` : '')}
`;

const StoresTreeContainer = styled.div<{ hide: Boolean }>`
  height: 100%;
  ${({ hide }) => (hide ? `display: none;` : '')}
`;
