# Q & A

## Why does it show `<anonymous> render` in devtools?

Suppose there is a `TodoList component` rendering like below:

```tsx
const TodoList = observer(() => {
  const { todoStore } = rootStore;
  const handleInputKeydown = useCallback(e => {
    if (e.keyCode === 13) {
      todoStore.addTodo(e.target.value);
      e.target.value = '';
    }
  }, []);
  return (
    <div>
      {todoStore.todos.map(t => (
        <Todo key={t.id} todo={t} />
      ))}
      <input onKeyDown={handleInputKeydown} />
    </div>
  );
});

render(<TodoList />, document.querySelector('#root'));
```

Because the `observer` is wrapped in an `arrow function (anonymous function)`. So when the TodoList component is re-rendered by the `observer`, it will show `<anonymous> render` in devtools.

To make it clear which component was re-rendered by the `observer`, you can add a name to the function component, like below:

```tsx
const TodoList = observer(function TodoList () {
  // ...
});
```
