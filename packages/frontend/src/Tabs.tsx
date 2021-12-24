import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { ActionStateTree } from './ActionStateTree';
import { DiffTree } from './DiffTree';
import { StoresTree } from './StoresTree';
import { PRIMARY_BG_COLOR } from './constant/color';
import { useStores } from './contexts/storesProvider';
import { TabNames } from './stores/TabsStore';

export const Tabs = observer(() => {
  const {tabsStore} = useStores();

  return (
    <Container>
      <Header>
        <Title>{tabsStore.selectedTab}</Title>
        <div>
          <ActionButton
            onClick={() => tabsStore.setSelectedTab(TabNames.ACTION)}
            selected={tabsStore.selectedTab === TabNames.ACTION}
          >
            Action
          </ActionButton>
          <Button
            onClick={() => tabsStore.setSelectedTab(TabNames.DIFF)}
            selected={tabsStore.selectedTab === TabNames.DIFF}
          >
            Diff
          </Button>
          <StateButton
            onClick={() => tabsStore.setSelectedTab(TabNames.STATE)}
            selected={tabsStore.selectedTab === TabNames.STATE}
          >
            State
          </StateButton>
        </div>
      </Header>

      <Body>
        <TreeContainer hide={tabsStore.selectedTab !== TabNames.ACTION}>
          <ActionStateTree />
        </TreeContainer>

        <DiffTreeContainer hide={tabsStore.selectedTab !== TabNames.DIFF}>
          <DiffTree></DiffTree>
        </DiffTreeContainer>

        <StoresTreeContainer hide={tabsStore.selectedTab !== TabNames.STATE}>
          <StoresTree></StoresTree>
        </StoresTreeContainer>
      </Body>
    </Container>
  );
});

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

const DiffTreeContainer = styled.div<{ hide: Boolean }>`
  height: 100%;
  padding: 16px;
  ${({ hide }) => (hide ? `display: none;` : '')}
`;

const StoresTreeContainer = styled.div<{ hide: Boolean }>`
  height: 100%;
  ${({ hide }) => (hide ? `display: none;` : '')}
`;
