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

const storeInstance = new TodoStore();

const TodoComponent = observer(({ id, title }) => (
  <div>
    #{id} <strong>{title}</strong>
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
        <TodoComponent key={t.id} {...t} />
      ))}
      <input type="test" onKeyDown={handleInputKeydown} />
    </div>
  );
});

render(<TodoAppComponent />, document.querySelector('#root'));
