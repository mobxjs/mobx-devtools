import { makeAutoObservable } from 'mobx';

const getId = (() => {
  let i = 1;
  return () => {
    i += 1;
    return i;
  };
})();

export default class TodoStore {
  rootStore = undefined;

  todos = [{ title: 'Get biscuit', id: getId() }];

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get completedTodos() {
    return this.todos.filter(t => t.title.includes('123'));
  }

  addTodo(title) {
    this.todos.push({
      id: getId(),
      title,
    });
  }
}
