const map = new WeakMap();

let i = 0;

export default (object) => {
  const id = map.get(object);
  if (id) return id;
  i += 1;
  map.set(object, i);
  return i;
};
