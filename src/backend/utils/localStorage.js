export default {
  getItem(key) {
    return typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(key)
      : undefined;
  },
  setItem(key, value) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }
};
