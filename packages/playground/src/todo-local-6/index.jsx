/* eslint-disable react/prop-types */
import React from 'react';
import { useLocalObservable, Observer } from 'mobx-react';
import { createRoot } from 'react-dom/client';

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

createRoot(document.querySelector('#root')).render(<Todo />);
