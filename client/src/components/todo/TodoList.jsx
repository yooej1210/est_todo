// client/src/components/todo/TodoList.jsx
import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onEditText, onDelete }) {
  if (!todos?.length) {
    return <div className="emptyBox">등록된 할 일이 없습니다.</div>;
  }

  return (
    <div className="todoList">
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          t={t}
          onToggle={onToggle}
          onEditText={onEditText}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
