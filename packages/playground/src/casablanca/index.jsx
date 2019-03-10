/* eslint-disable react/prop-types */
import React from 'react';
import { types, destroy } from 'mobx-state-tree';
import { observer } from 'mobx-react';
import { render } from 'react-dom';
import inspectTree from 'mobx-devtools-mst'; // eslint-disable-line

const getId = (() => { let i = 1; return () => { i += 1; return i; }; })();

const Todo = types.model({
  id: types.number,
  title: types.string,
});

const TodoStore = types
  .model('TodoStore', {
    todos: types.array(Todo),
  })
  .views(self => ({
    get completedTodos() {
      return self.todos.filter(t => t.done);
    },
    findTodosByUser(user) {
      return self.todos.filter(t => t.assignee === user);
    },
  }))
  .actions(self => ({
    addTodo(title) {
      self.todos.push({
        id: getId(),
        title,
      });
    },
  }));

const storeInstance = inspectTree(TodoStore.create({
  todos: [{ title: 'Get biscuit', id: getId() }],
}));

class TodoComponent extends React.Component {
  render() {
    return (
      <div>
        #{this.props.id} <strong>{this.props.title}</strong>
      </div>
    );
  }
}

@observer
class TodoAppComponent extends React.Component {
  handleInputKeydown = (e) => {
    if (e.keyCode === 13) {
      storeInstance.addTodo(e.target.value);
      e.target.value = '';
    }
  };

  render() {
    return (
      <div>
        {storeInstance.todos.map(t => <TodoComponent key={t.id} {...t} />)}
        <input type="test" onKeyDown={this.handleInputKeydown} />
        <button onClick={() => destroy(storeInstance)}>destroy</button>
      </div>
    );
  }
}

render(
  <TodoAppComponent />,
  document.querySelector('#root')
);

