/* eslint-disable react/prop-types */
import React from 'react';
import { useLocalObservable, Observer } from 'mobx-react';
import { render } from 'react-dom';

const TodoModel = {
  title: 'Test',
  done: true,
  toggle() {
    this.done = !this.done;
  },
};

const Todo = () => {
  const todo = useLocalObservable(() => TodoModel);

  return (
    <Observer>
      {() => (
        <div onClick={todo.toggle}>
          {todo.title} {todo.done ? '[DONE]' : '[TODO]'}
        </div>
      )}
    </Observer>
  );
};

render(<Todo />, document.querySelector('#root'));
