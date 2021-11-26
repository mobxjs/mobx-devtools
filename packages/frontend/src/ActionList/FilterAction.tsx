import React, { memo } from 'react';
import styled from 'styled-components';
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
    <Container>
      <Input value={keyword} onChange={onKeywordChange} placeholder="Filter actions" />
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 50px;
  border-bottom: ${GREY_BORDER} 1px solid;
`;

const Input = styled.input`
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  padding: 8px 16px;
  font-size: 18px;
`;
