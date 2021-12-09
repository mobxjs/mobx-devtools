export const stringifyAndShrink = (val: any, isWideLayout?: boolean) => {
  if (val === null) {
    return 'null';
  }

  const str = JSON.stringify(val);
  if (typeof str === 'undefined') {
    return 'undefined';
  }

  if (isWideLayout) return str.length > 42 ? str.substr(0, 30) + '…' + str.substr(-10) : str;
  return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str;
}

export const prepareDelta = (value: any) => {
  if (value && value._t === 'a') {
    const res: { [key: string]: any } = {};
    for (const key in value) {
      if (key !== '_t') {
        if (key[0] === '_' && !value[key.substr(1)]) {
          res[key.substr(1)] = value[key];
        } else if (value['_' + key]) {
          res[key] = [value['_' + key][0], value[key][0]];
        } else if (!value['_' + key] && key[0] !== '_') {
          res[key] = value[key];
        }
      }
    }
    return res;
  }

  return value;
}