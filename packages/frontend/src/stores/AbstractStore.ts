export default class AbstractStore {
  $listeners = {};

  $disposables: any[] = [];

  setValueAndEmit(key, value) {
    if (this[key] !== value) {
      this[key] = value;
      this.emit(key);
    }
  }

  addDisposer(...fns) {
    this.$disposables.push(...fns);
  }

  removeDisposer(fn) {
    const idx = this.$disposables.indexOf(fn);
    if (idx !== -1) {
      this.$disposables.splice(idx, 1);
    }
  }

  emit = event => {
    if (this.$listeners[event]) {
      this.$listeners[event].forEach(fn => fn());
    }
  };

  subscribe = (event, fn) => {
    this.on(event, fn);
    const dispose = () => {
      this.off(event, fn);
      this.removeDisposer(dispose);
    };
    this.addDisposer(dispose);
    return dispose;
  };

  on(event, fn) {
    if (!this.$listeners[event]) {
      this.$listeners[event] = [];
    }
    this.$listeners[event].push(fn);
  }

  off(event, fn) {
    const idx = this.$listeners[event].indexOf(fn);
    if (idx !== -1) {
      this.$listeners[event].splice(idx, 1);
    }
  }

  dispose() {
    this.$disposables.forEach(fn => fn());
    this.$disposables.splice(0);
  }
}
