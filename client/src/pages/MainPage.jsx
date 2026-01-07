import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { logoutApi } from "../api/auth.api";
import TodoForm from "../components/todo/TodoForm";
import TodoList from "../components/todo/TodoList";

import {
  listTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "../api/todo.api";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/category.api";

import { useNavigate } from "react-router-dom";

// ✅ 노션톤 카테고리 색상 팔레트(한 파일 안에서만 사용) — mood 제거
const CATEGORY_COLORS = [
  { name: "Default (Gray)", hex: "#F1F1EF" },
  { name: "Brown", hex: "#F4EEEE" },
  { name: "Orange", hex: "#FBECDD" },
  { name: "Yellow", hex: "#FBF3DB" },
  { name: "Green", hex: "#EDF3EC" },
  { name: "Blue (기본)", hex: "#E7F3F8" },
  { name: "Purple", hex: "#F6F3F9" },
  { name: "Pink", hex: "#FAF1F5" },
  { name: "Red", hex: "#FDEBEC" },
];

function toLocalDateInputValue(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmt(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function MainPage() {
  const nav = useNavigate();

  // filters
  const [filter, setFilter] = useState("today"); // today | week | date | all
  const [date, setDate] = useState(toLocalDateInputValue());

  // data
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState("");

  // create form
  const [form, setForm] = useState({
    text: "",
    categoryId: "",
    isAllDay: false,
    startDate: "",
    endDate: "",
  });

  // ✅ category form (기본값 Blue)
  const [catForm, setCatForm] = useState({ name: "", color: "#E7F3F8" });

  const selectedParams = useMemo(() => {
    if (filter === "today") return { filter: "today" };
    if (filter === "week") return { filter: "week" };
    if (filter === "date") return { date };
    return {}; // all
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, date]);

  const onCreateTodo = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.text.trim()) {
      setErr("할 일을 입력해주세요.");
      return;
    }

    const payload = {
      text: form.text.trim(),
      categoryId: form.categoryId ? form.categoryId : null,
      isAllDay: !!form.isAllDay,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    };

    try {
      const created = await createTodo(payload);
      setTodos((prev) => [created, ...prev]);
      setForm({ text: "", categoryId: "", isAllDay: false, startDate: "", endDate: "" });
    } catch (e2) {
      const msg =
        e2?.response?.data?.errors?.[0]?.message ||
        e2?.response?.data?.message ||
        "생성에 실패했습니다.";
      setErr(msg);
    }
  };

  const onToggle = async (id) => {
    setErr("");
    try {
      const updated = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setErr(e?.response?.data?.message || "토글 실패");
    }
  };

  const onEditText = async (t) => {
    const next = prompt("수정할 내용을 입력하세요.", t.text);
    if (next === null) return;
    const v = next.trim();
    if (!v) return;

    setErr("");
    try {
      const updated = await updateTodo(t.id, { text: v });
      setTodos((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e) {
      setErr(e?.response?.data?.message || "수정 실패");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("삭제할까요?")) return;
    setErr("");
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "삭제 실패");
    }
  };

  const onCreateCategory = async (e) => {
    e.preventDefault();
    setErr("");
    if (!catForm.name.trim()) {
      setErr("카테고리 이름을 입력해주세요.");
      return;
    }

    // ✅ 허용 팔레트 중 하나인지 한번 더 방어(프론트 조작 대비)
    const allowed = CATEGORY_COLORS.some((c) => c.hex === catForm.color);
    const safeColor = allowed ? catForm.color : "#E7F3F8";

    try {
      const created = await createCategory({
        name: catForm.name.trim(),
        color: safeColor,
      });
      setCategories((prev) => [created, ...prev]);
      setCatForm({ name: "", color: "#E7F3F8" });
    } catch (e2) {
      const msg =
        e2?.response?.data?.errors?.[0]?.message ||
        e2?.response?.data?.message ||
        "카테고리 생성 실패";
      setErr(msg);
    }
  };

  const onRenameCategory = async (c) => {
    const name = prompt("카테고리 이름 수정", c.name);
    if (name === null) return;
    const v = name.trim();
    if (!v) return;

    setErr("");
    try {
      const updated = await updateCategory(c.id, { name: v });
      setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch (e) {
      setErr(e?.response?.data?.message || "수정 실패");
    }
  };

  const onDeleteCategory = async (id) => {
    if (!confirm("카테고리를 삭제할까요? (연결된 Todo는 정책에 따라 처리됨)")) return;
    setErr("");
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      // UI 상에서 선택된 categoryId가 삭제됐으면 해제
      setForm((p) => (p.categoryId === id ? { ...p, categoryId: "" } : p));
      loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "삭제 실패");
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch { }
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  return (
    <div className="main-wrap">
      <div className="main-shell">
        {/* LEFT: Category */}
        <aside className="panel side">
          <div className="header">
            <div>
              <h2 className="title">카테고리</h2>
              <div className="sub">사용자별 카테고리 관리</div>
            </div>
            <div style={{ width: 110 }}>
              <Button variant="ghost" onClick={logout}>
                로그아웃
              </Button>
            </div>
          </div>

          <form className="form-card" onSubmit={onCreateCategory}>
            <Input
              label="새 카테고리"
              placeholder="예: 공부"
              value={catForm.name}
              onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
            />

            {/* ✅ 색상 팔레트 선택 UI (느낌 텍스트 제거, HEX만 표기) */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>색상 선택</label>
              <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                {CATEGORY_COLORS.map((c) => (
                  <label
                    key={c.hex}
                    style={{
                      display: "flex",
                      gap: 10,
                      cursor: "pointer",
                      alignItems: "flex-start",
                      padding: "8px 10px",
                      border:
                        catForm.color === c.hex
                          ? "1px solid rgba(91,124,255,0.7)"
                          : "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="categoryColor"
                      checked={catForm.color === c.hex}
                      onChange={() => setCatForm((p) => ({ ...p, color: c.hex }))}
                      style={{ marginTop: 4 }}
                    />
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        background: c.hex,
                        border: "1px solid #ddd",
                        marginTop: 2,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{c.hex}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="helper">노션 스타일 팔레트에서만 선택할 수 있어요.</div>
            </div>

            <div style={{ alignSelf: "end" }}>
              <Button>추가</Button>
            </div>
          </form>

          <div className="cat-list">
            {categories.map((c) => (
              <div className="cat" key={c.id}>
                <div className="left">
                  <div className="dot" style={{ background: c.color || "#e5e7eb" }} />
                  <div className="name">{c.name}</div>
                </div>
                <div className="mini">
                  <Button variant="ghost" onClick={() => onRenameCategory(c)}>
                    수정
                  </Button>
                  <Button variant="ghost" onClick={() => onDeleteCategory(c.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT: Todos */}
        <main className="panel">
          <div className="header">
            <div>
              <h1 className="title">Todo & 일정</h1>
              <div className="sub">필터(오늘/이번주/날짜) + 일정(start/end/all-day)</div>
            </div>
          </div>

          <section className="controls">
            <div className="row">
              <button
                className={`chip ${filter === "today" ? "active" : ""}`}
                onClick={() => setFilter("today")}
                type="button"
              >
                오늘
              </button>
              <button
                className={`chip ${filter === "week" ? "active" : ""}`}
                onClick={() => setFilter("week")}
                type="button"
              >
                이번 주
              </button>
              <button
                className={`chip ${filter === "date" ? "active" : ""}`}
                onClick={() => setFilter("date")}
                type="button"
              >
                날짜
              </button>
              <button
                className={`chip ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
                type="button"
              >
                전체
              </button>
            </div>

            {filter === "date" && (
              <div className="row">
                <Input
                  label="조회 날짜"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  helper="해당 날짜 범위와 겹치는 일정이 조회됩니다."
                />
              </div>
            )}
          </section>

          <TodoForm
            form={form}
            setForm={setForm}
            categories={categories}
            onCreateTodo={onCreateTodo}
            err={err}
          />

          <TodoList
            todos={todos}
            onToggle={onToggle}
            onEditText={onEditText}
            onDelete={onDelete}
          />

        </main>
      </div>
    </div>
  );
}
