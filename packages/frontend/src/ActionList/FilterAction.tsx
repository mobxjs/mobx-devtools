import React, { memo } from 'react';
import styled from 'styled-components';
import { BLACK_FONT, GREY_BORDER, GREY_FILL, PRIMARY_FONT_COLOR } from '../constant/color';

export type FilterActionProps = {
  keyword: string;
  setKeyword: (keyword: string) => void;
  caseEnable: boolean;
  setCaseEnable: (caseEnable: boolean) => void;
  regexEnable: boolean;
  setRegexEnable: (regexEnable: boolean) => void;
};

export const FilterAction = memo((props: FilterActionProps) => {
  const { caseEnable, keyword, regexEnable, setCaseEnable, setKeyword, setRegexEnable } = props;

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <Container>
      <Input value={keyword} onChange={onKeywordChange} placeholder="Search logs" />
      <StyledFunctionBar>
        <StyledIcon
          checked={caseEnable}
          onClick={() => setCaseEnable(!caseEnable)}
          title="Match case"
        >
          Aa
        </StyledIcon>
        <StyledIcon
          checked={regexEnable}
          onClick={() => setRegexEnable(!regexEnable)}
          title="Use regular expression"
        >
          .*
        </StyledIcon>
      </StyledFunctionBar>
    </Container>
  );
});

const Container = styled.div`
  position: relative;
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

const StyledFunctionBar = styled.div`
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 48px;
  top: 13px;
  right: 16px;
  height: 23px;
`;

const StyledIcon = styled.div<{ checked: Boolean }>`
  width: 21px;
  height: 21px;
  line-height: 21px;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  color: ${({ checked }) => (checked ? PRIMARY_FONT_COLOR : GREY_FILL)};
  border: ${({ checked }) => (checked ? '1px solid' + PRIMARY_FONT_COLOR : '1px solid #FFF')};
  background-color: ${({ checked }) => (checked ? PRIMARY_FONT_COLOR + '33' : 'transparent')};
  transition: 0.3s ease;

  :hover {
    color: ${({ checked }) => (checked ? PRIMARY_FONT_COLOR : BLACK_FONT)};
  }
`;
