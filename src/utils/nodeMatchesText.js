import * as SearchUtils from './SearchUtils';

export default function nodeMatchesText(node, needle) {
  const name = node.name;
  const useRegex = SearchUtils.shouldSearchUseRegex(needle);
  if (name) {
    return validString(name, needle, useRegex);
  }
  const text = node.text;
  if (text) {
    return validString(text, needle, useRegex);
  }
  const children = node.children;
  if (typeof children === 'string') {
    return validString(children, needle, useRegex);
  }
  return false;
}

function validString(str, needle, regex) {
  if (regex) {
    try {
      const regExp = SearchUtils.searchTextToRegExp(needle);
      return regExp.test(str.toLowerCase());
    } catch (error) {
      return false;
    }
  }
  return str.toLowerCase().indexOf(needle) !== -1;
}
