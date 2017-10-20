export function isValidRegex(needle) {
  let isValid = true;

  if (needle) {
    try {
      searchTextToRegExp(needle);
    } catch (error) {
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Convert the specified search text to a RegExp.
 */
export function searchTextToRegExp(needle) {
  return new RegExp(trimSearchText(needle), 'gi');
}

/**
 * Should the current search text be converted to a RegExp?
 */
export function shouldSearchUseRegex(needle) {
  return !!needle && needle.charAt(0) === '/' && trimSearchText(needle).length > 0;
}

/**
 * '/foo/' => 'foo'
 * '/bar' => 'bar'
 * 'baz' => 'baz'
 */
export function trimSearchText(needle) {
  if (needle.charAt(0) === '/') {
    return needle.substr(1);
  }
  if (needle.charAt(needle.length - 1) === '/') {
    return needle.substr(0, needle.length - 1);
  }
  return needle;
}
