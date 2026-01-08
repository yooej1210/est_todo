// client/src/components/todo/TodoList.jsx
import { useLayoutEffect, useRef } from "react";
import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onEditText, onDelete }) {
  const listRef = useRef(null);
  const scrollTopRef = useRef(0);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = scrollTopRef.current;
  }, [todos]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    scrollTopRef.current = el.scrollTop;
  };
  if (!todos?.length) {
    return <div className="emptyBox">?깅줉?????쇱씠 ?놁뒿?덈떎.</div>;
  }

  return (
    <div className="todoList" ref={listRef} onScroll={handleScroll}>
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
