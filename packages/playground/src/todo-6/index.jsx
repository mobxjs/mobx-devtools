/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { makeObservable, observable, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { render } from 'react-dom';

const getId = (() => {
  let i = 1;
  return () => {
    i += 1;
    return i;
  };
})();

class TodoStore {
  todos = [{ title: 'Get biscuit', id: getId() }];

  constructor() {
    makeObservable(this, {
      todos: observable,
      completedTodos: computed,
      addTodo: action,
    });
  }

  get completedTodos() {
    return this.todos.filter(t => t.done);
  }

  addTodo(title) {
    this.todos.push({
      id: getId(),
      title,
    });
  }
}

/**
 * stores = {
 *   storeA: { a: 1 },
 *   storeB: { b: 2}
 * }
 */
const injectStores = (stores) => {
  // eslint-disable-next-line no-underscore-dangle
  window.__MOBX_DEVTOOLS_GLOBAL_STORES_HOOK__ = {
    stores,
  };
};

const storeInstance = new TodoStore();

injectStores({ TodoStore: storeInstance });

const TodoComponent = observer(({ todo }) => (
  <div>
    #{todo.id} <strong>{todo.title}</strong>
  </div>
));

const TodoAppComponent = observer(() => {
  const handleInputKeydown = useCallback(e => {
    if (e.keyCode === 13) {
      storeInstance.addTodo(e.target.value);
      e.target.value = '';
    }
  }, []);

  return (
    <div>
      {storeInstance.todos.map(t => (
        <TodoComponent key={t.id} todo={t} />
      ))}
      <input type="test" onKeyDown={handleInputKeydown} />
    </div>
  );
});

render(<TodoAppComponent />, document.querySelector('#root'));
