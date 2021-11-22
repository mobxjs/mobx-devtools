import TodoStore from './TodoStore';

export default class RootStore {
  todoStore = new TodoStore(this);
}
