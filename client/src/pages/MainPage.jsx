import { useEffect, useMemo, useState } from "react";
import Input from "../components/Input";
import { logoutApi } from "../api/auth.api";
import TodoForm from "../components/todo/TodoForm";
import TodoList from "../components/todo/TodoList";
import CategoryPanel from "../components/category/CategoryPanel";
import { useNavigate } from "react-router-dom";

import { listTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from "../api/todo.api";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../api/category.api";

// ✅ 노션톤 카테고리 색상 팔레트
const CATEGORY_COLORS = [
  { name: "Gray", hex: "#E3E3E1" },
  { name: "Brown", hex: "#EADDD8" },
  { name: "Orange", hex: "#F6D7B8" },
  { name: "Yellow", hex: "#F3E5A6" },
  { name: "Green", hex: "#DCE8DA" },
  { name: "Blue", hex: "#D6EAF3" },
  { name: "Purple", hex: "#E8E0F0" },
  { name: "Pink", hex: "#F2DCE6" },
  { name: "Red", hex: "#F4D0CC" },
];

function toLocalDateInputValue(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function MainPage() {
  const nav = useNavigate();

  // ✅ 상태 관리
  const [filter, setFilter] = useState("today");
  const [date, setDate] = useState(toLocalDateInputValue());
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    text: "",
    categoryId: "",
    isAllDay: false,
    startDate: "",
    endDate: "",
  });

  const [catForm, setCatForm] = useState({ name: "", color: "#D6EAF3" });
  const [err, setErr] = useState("");

  const selectedParams = useMemo(() => {
    if (filter === "today") return { filter: "today" };
    if (filter === "week") return { filter: "week" };
    if (filter === "date") return { date };
    return {};
  }, [filter, date]);

  const loadAll = async () => {
    setErr("");
    try {
      const [t, c] = await Promise.all([listTodos(selectedParams), listCategories()]);
      setTodos(t);
      setCategories(c);
    } catch (e) {
      setErr(e?.response?.data?.message || "데이터를 불러오지 못했습니다.");
      if (e?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        nav("/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    loadAll();
  }, [filter, date]);

  // ===== Todo 핸들러 =====
  const onCreateTodo = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.text.trim()) { setErr("할 일을 입력해주세요."); return; }

    const payload = {
      text: form.text.trim(),
      categoryId: form.categoryId || null,
      isAllDay: !!form.isAllDay,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    };

    try {
      const created = await createTodo(payload);
      setTodos((prev) => [created, ...prev]);
      setForm({ text: "", categoryId: "", isAllDay: false, startDate: "", endDate: "" });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "생성에 실패했습니다.");
    }
  };

  const onToggle = async (id) => {
    try {
      const updated = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch { setErr("토글 실패"); }
  };

  const onEditText = async (t) => {
    const next = prompt("수정할 내용을 입력하세요.", t.text);
    if (!next?.trim()) return;
    try {
      const updated = await updateTodo(t.id, { text: next.trim() });
      setTodos((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch { setErr("수정 실패"); }
  };

  const onDelete = async (id) => {
    if (!confirm("삭제할까요?")) return;
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch { setErr("삭제 실패"); }
  };

  // ===== Category 핸들러 =====
  const onCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    try {
      const created = await createCategory({ name: catForm.name.trim(), color: catForm.color });
      setCategories((prev) => [created, ...prev]);
      setCatForm({ name: "", color: "#D6EAF3" });
    } catch { setErr("카테고리 생성 실패"); }
  };

  const onRenameCategory = async (c) => {
    const name = prompt("카테고리 이름 수정", c.name);
    if (!name?.trim()) return;
    try {
      const updated = await updateCategory(c.id, { name: name.trim() });
      setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch { setErr("수정 실패"); }
  };

  const onDeleteCategory = async (id) => {
    if (!confirm("카테고리를 삭제할까요?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      loadAll();
    } catch { setErr("삭제 실패"); }
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  return (
    <div className="main-wrap">
      <div className="main-shell">
        <CategoryPanel
          categories={categories}
          catForm={catForm}
          setCatForm={setCatForm}
          onCreateCategory={onCreateCategory}
          onRenameCategory={onRenameCategory}
          onDeleteCategory={onDeleteCategory}
          onLogout={logout}
          palette={CATEGORY_COLORS}
        />

        <main className="panel">
          <div className="header">
            <div>
              <h1 className="title">Todo Dashboard</h1>
              <div className="sub">일정을 등록하고 관리하세요.</div>
            </div>
          </div>

          {/* ✅ 1. 등록 섹션 (수직 배치) */}
          <section className="sectionCard">
            <div className="sectionTitle">할일 등록</div>
            <TodoForm form={form} setForm={setForm} categories={categories} onCreateTodo={onCreateTodo} err={err} />
          </section>

          {/* ✅ 2. 조회 섹션 */}
          <section className="sectionCard" style={{ marginTop: 14 }}>
            <div className="sectionTitle">조회 필터</div>
            <div className="controls" style={{ marginBottom: 0 }}>
              <div className="row">
                <button className={`chip ${filter === "today" ? "active" : ""}`} onClick={() => setFilter("today")}>오늘</button>
                <button className={`chip ${filter === "week" ? "active" : ""}`} onClick={() => setFilter("week")}>이번 주</button>
                <button className={`chip ${filter === "date" ? "active" : ""}`} onClick={() => setFilter("date")}>날짜</button>
                <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>전체</button>
              </div>
              {filter === "date" && (
                <div className="row" style={{ marginTop: 10 }}>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              )}
            </div>
          </section>

          {/* ✅ 3. 목록 섹션 */}
          <section className="sectionCard" style={{ marginTop: 14 }}>
            <div className="sectionTitle">할 일 목록</div>
            <TodoList todos={todos} onToggle={onToggle} onEditText={onEditText} onDelete={onDelete} />
          </section>
        </main>
      </div>
    </div>
  );
}