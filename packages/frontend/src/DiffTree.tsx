import React from 'react';
import { observer } from 'mobx-react-lite';
import JSONTree from 'react-json-tree';
import styled from 'styled-components';
import { useStores } from './contexts/storesProvider';
import { stringifyAndShrink, prepareDelta } from './utils/diff';

// TODO: update theme
const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#000',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

export const DiffTree = observer(() => {
  const { actionsLoggerStore } = useStores();

  const diff = actionsLoggerStore.diffById[actionsLoggerStore.selectedActionId];

  const hasSelect = !!actionsLoggerStore.selectedActionId;

  const valueRenderer = (raw: any, value: any) => {
    if (Array.isArray(value)) {
      switch (value.length) {
        case 1:
          return <DiffAdd key="diffAdd">{stringifyAndShrink(value[0])}</DiffAdd>;
        case 2:
          return (
            <span key="diffUpdate">
              <DiffRemove>{stringifyAndShrink(value[0])}</DiffRemove>
              <Arrow>{' => '}</Arrow>
              <DiffAdd>{stringifyAndShrink(value[1])}</DiffAdd>
            </span>
          );
        case 3:
          return <DiffRemove key="diffRemove">{stringifyAndShrink(value[0])}</DiffRemove>;
      }
    }

    return raw;
  };

  const renderContent = () => {
    if (!hasSelect) {
      return (
        <Container key="noSelect">
          <ReactJsonContainer>
            <JSONTree
              theme={theme}
              data={{ Tip: { message: 'Please select an action!' } }}
              valueRenderer={valueRenderer}
              postprocessValue={prepareDelta}
              isCustomNode={Array.isArray}
              hideRoot
              shouldExpandNode={() => true}
            />
          </ReactJsonContainer>
        </Container>
      );
    }

    const statesAreEqual = !Object.keys(diff || {}).length;

    if (statesAreEqual) {
      return <div key="statesAreEqual">(states are equal)</div>;
    }

    return (
      <Container key="selected">
        <ReactJsonContainer>
          <JSONTree
            theme={theme}
            data={diff}
            valueRenderer={valueRenderer}
            postprocessValue={prepareDelta}
            isCustomNode={Array.isArray}
            hideRoot
            shouldExpandNode={() => true}
          />
        </ReactJsonContainer>
      </Container>
    );
  };

  return <Container>{renderContent()}</Container>;
});

const Container = styled.div`
  height: 100%;
  position: relative;
`;

const DiffAdd = styled.span`
  display: inline-block;
  text-indent: 0;
  color: #fff;
  min-width: 18px;
  background-color: #596b47;
  border-radius: 4px;
  text-align: center;
  padding: 2px 4px;
`;

const DiffRemove = styled.span`
  display: inline-block;
  text-indent: 0;
  color: #fff;
  min-width: 18px;
  background-color: #7d5d67;
  border-radius: 4px;
  text-align: center;
  padding: 2px 4px;
  text-decoration: line-through;
`;

const Arrow = styled.span`
  color: #7d5d67;
`;

const ReactJsonContainer = styled.div`
  height: 100%;
  overflow: auto;
  margin-top: -12px;
  font-family: monospace;
  cursor: default;
  background-color: rgba(0, 0, 0, 0);
  font-size: 14px;
`;
