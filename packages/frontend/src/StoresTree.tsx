import React, { useState } from 'react';
import { set } from 'lodash';
import { observer } from 'mobx-react-lite';
import ReactJson from 'react-json-view';
import { useDebounce } from 'react-use';
import styled from 'styled-components';
import { PRIMARY_BG_COLOR } from './constant/color';
import { useStores } from './contexts/storesProvider';

type Path = {
  path: string;
  value: object;
};

const filterStores = (store: object, searchValue: string): object | undefined => {
  if (searchValue.length < 2) {
    return store;
  }
  const paths: Path[] = [];
  const findFromObject = (obj: object, path: string) => {
    if (!obj || typeof obj !== 'object') return;
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = `${path ? `${path}.` : ''}${key}`;
      if (key.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
        paths.push({
          path: newPath,
          value: value as object,
        });
      } else {
        findFromObject(value, newPath);
      }
    });
  };
  findFromObject(store, '');
  let src: object | undefined = {};
  if (paths.length) {
    paths.forEach(({ path, value }) => set(src as object, path, value));
  } else {
    src = undefined;
  }
  return src;
};

export const StoresTree = observer(() => {
  const { storesStore } = useStores();
  const [searchValue, setSearchValue] = useState('');
  const [filteredStores, setFilteredStores] = useState<object | undefined>(storesStore.stores);

  const handleRefresh = () => {
    storesStore.requestStores();
  };

  if (storesStore.noInject) {
    return (
      <TipContainer>
        If you want to use State, please refer to this{' '}
        <a href="https://www.npmjs.com/package/@mobx-devtools/tools" target="_blank">
          document
        </a>
        , and then inject stores of application.
      </TipContainer>
    );
  }

  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSearchValue(e.target.value);
  };

  useDebounce(
    () => {
      if (searchValue.length < 2) {
        setFilteredStores(storesStore.stores);
      } else {
        const stores = filterStores(storesStore.stores, searchValue);
        setFilteredStores(stores);
      }
    },
    300,
    [searchValue, storesStore.stores],
  );

  return (
    <Container>
      <ContentContainer>
        <StyledSearch
          onChange={handleSearch}
          value={searchValue}
          placeholder="Search by key"
        ></StyledSearch>
        <ReactJsonContainer>
          {!filteredStores && <Empty>No data</Empty>}
          {!!filteredStores &&
            Object.entries(filteredStores).map(([storeName, store], index) => {
              return (
                <ReactJson
                  key={`${storeName}-${index}`}
                  name={storeName}
                  src={store}
                  indentWidth={2}
                  collapsed={searchValue.length > 1 ? false : 1}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={true}
                  quotesOnKeys={false}
                  style={{ fontSize: 14 }}
                />
              );
            })}
        </ReactJsonContainer>
      </ContentContainer>
      <RefreshButton onClick={handleRefresh}>Refresh</RefreshButton>
    </Container>
  );
});

const TipContainer = styled.div`
  padding: 16px;
`;

const Container = styled.div`
  height: 100%;
  position: relative;
`;

const RefreshButton = styled.button`
  width: 60px;
  height: 24px;
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: #323d4c;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.1s;
  &:hover {
    background-color: ${PRIMARY_BG_COLOR};
    opacity: 0.9;
    color: #fff;
    border-color: ${PRIMARY_BG_COLOR};
  }
  &:active {
    opacity: 1;
  }
`;

const ContentContainer = styled.div`
  height: 100%;
  overflow: auto;
  padding: 16px;
  padding-top: 0;
`;

const ReactJsonContainer = styled.div`
  height: calc(100% - 26px);
  overflow: auto;
`;

const StyledSearch = styled.input`
  position: sticky;
  top: 0;
  color: #323d4c;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  height: 26px;
  border-radius: 2px;
  width: 100%;
  margin-bottom: 4px;
  z-index: 1;
  &:focus {
    outline: none;
    border: 1px solid #a29d9d;
  }
`;

const Empty = styled.div`
  height: 36px;
  line-height: 36px;
  text-align: center;
  color: #000000d9;
`;
