import { symbols } from '../../Bridge';

export default value => {
  if (!value) {
    return;
  }

  const finalValue = value[symbols.type] === 'deptreeNode' ? value.node : value;

  let suffix = 0;
  let varname = 'temp';
  while (varname in window) {
    suffix += 1;
    varname = `temp${suffix}`;
  }
  window[varname] = finalValue;
  console.log(varname, finalValue); // eslint-disable-line no-console
};
