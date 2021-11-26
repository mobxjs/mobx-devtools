import React from 'react';
import styled from 'styled-components';
import { ActionList } from './ActionList/ActionList';
import { Tabs } from './Tabs';

export const Panel = () => {
  return (
    <Container>
      <ActionListContainer>
        <ActionList />
      </ActionListContainer>
      <TabsContainer>
        <Tabs></Tabs>
      </TabsContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
`;

const ActionListContainer = styled.div`
  flex: 1;
  border-right: 1px solid #f4f4f4;
`;

const TabsContainer = styled.div`
  flex: 1;
`;
