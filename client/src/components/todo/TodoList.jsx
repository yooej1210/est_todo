// client/src/components/todo/TodoList.jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import TodoItem from "./TodoItem";

function sortByDateDesc(list) {
  return [...list].sort((a, b) => {
    const aStart = a.startDate ? new Date(a.startDate).getTime() : Number.NEGATIVE_INFINITY;
    const bStart = b.startDate ? new Date(b.startDate).getTime() : Number.NEGATIVE_INFINITY;
    if (aStart !== bStart) return bStart - aStart;
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    const aId = a.id ? String(a.id) : "";
    const bId = b.id ? String(b.id) : "";
    return bId.localeCompare(aId);
  });
}

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

  const { pending, completed } = useMemo(() => {
    const sorted = sortByDateDesc(todos || []);
    return {
      pending: sorted.filter((t) => !t.isCompleted),
      completed: sorted.filter((t) => t.isCompleted),
    };
  }, [todos]);

  if (!todos?.length) {
    return <div className="emptyBox">등록된 일정이 없습니다.</div>;
  }

  return (
    <div className="todoList" ref={listRef} onScroll={handleScroll}>
      <div className="todoSectionTitle">등록된 일정</div>
      {pending.map((t) => (
        <TodoItem
          key={t.id}
          t={t}
          onToggle={onToggle}
          onEditText={onEditText}
          onDelete={onDelete}
        />
      ))}

      {completed.length > 0 && <div className="todoSectionTitle">완료된 일정</div>}

      {completed.map((t) => (
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
