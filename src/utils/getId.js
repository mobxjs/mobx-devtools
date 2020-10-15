const map = new WeakMap();

let i = 0;

export default object => {
  const id = object && map.get(object);
  if (id) return id;
  i += 1;
  if (object) map.set(object, i);
  return i;
};
