import { useEffect, useMemo, useState } from "react";
import Input from "../components/Input";
import { logoutApi } from "../api/auth.api";
import TodoForm from "../components/todo/TodoForm";
import TodoList from "../components/todo/TodoList";
import CategoryPanel from "../components/category/CategoryPanel";
import { useNavigate } from "react-router-dom";

import { listTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from "../api/todo.api";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../api/category.api";
import EditTodoModal from "../components/modal/EditTodoModal";
import EditCategoryModal from "../components/modal/EditCategoryModal";
import ErrorModal from "../components/modal/ErrorModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import { CATEGORY_COLORS } from "../constants/categoryColors";

function toLocalDateInputValue(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeekMondayLocal(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun, 1=Mon
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeekMondayLocal(d) {
  const start = startOfWeekMondayLocal(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function todoMatchesFilter(todo, filter, dateValue) {
  if (filter === "all") return true;
  if (!todo?.startDate) return false;
  const start = new Date(todo.startDate);
  if (filter === "today") {
    const now = new Date();
    return start >= startOfDayLocal(now) && start <= endOfDayLocal(now);
  }
  if (filter === "week") {
    const now = new Date();
    return start >= startOfWeekMondayLocal(now) && start <= endOfWeekMondayLocal(now);
  }
  if (filter === "date") {
    if (!dateValue) return true;
    const d = new Date(`${dateValue}T00:00:00`);
    return start >= startOfDayLocal(d) && start <= endOfDayLocal(d);
  }
  return true;
}

function sortTodos(list) {
  return [...list].sort((a, b) => {
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    const aId = a.id ? String(a.id) : "";
    const bId = b.id ? String(b.id) : "";
    return bId.localeCompare(aId);
  });
}

export default function MainPage() {
  const nav = useNavigate();

  // ✅ 조회(필터) 상태
  const [filter, setFilter] = useState("today"); // today | week | date | all
  const [date, setDate] = useState(toLocalDateInputValue());

  // ✅ 데이터
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);

  // ✅ 수정 모달 상태
  const [editTodoOpen, setEditTodoOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // ✅ 등록 폼 상태
  const [form, setForm] = useState({
    text: "",
    categoryId: "",
    isAllDay: false,
    startDate: "",
    endDate: "",
  });

  // ✅ 카테고리 폼 상태
  const [catForm, setCatForm] = useState({ name: "", color: "#D6EAF3" });

  // ✅ 에러(원하면 ErrorModal로 바꿔도 됨)
  const [err, setErr] = useState("");
  const showError = (message) => {
    const msg = message || "문제가 발생했습니다.";
    setErr(msg);
    setErrorModal({ open: true, message: msg });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
  };

  const openConfirm = (title, message, onConfirm) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };

  const handleConfirm = async () => {
    const fn = confirmModal.onConfirm;
    closeConfirm();
    if (fn) await fn();
  };

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
      showError(e?.response?.data?.message || "데이터를 불러오지 못했습니다.");
      if (e?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        nav("/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    loadAll();
  }, [filter, date]);

  // ===== Todo =====
  const onCreateTodo = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.text.trim()) {
      showError("할 일을 입력해주세요.");
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
      showError(msg);
    }
  };

  const onToggle = async (id) => {
    setErr("");
    try {
      const updated = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      showError(e?.response?.data?.message || "토글 실패");
    }
  };

  const onEditText = async (t) => {
    setEditingTodo(t);
    setEditTodoOpen(true);
  };

  const onDelete = (id) => {
    openConfirm("삭제", "삭제할까요?", async () => {
      setErr("");
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch (e) {
        showError(e?.response?.data?.message || "삭제 실패");
      }
    });
  };

  // ===== Category =====
  const onCreateCategory = async (e) => {
    e.preventDefault();
    setErr("");

    if (!catForm.name.trim()) {
      showError("카테고리 이름을 입력해주세요.");
      return;
    }

    const allowed = CATEGORY_COLORS.some((c) => c.hex === catForm.color);
    const safeColor = allowed ? catForm.color : "#D6EAF3";

    try {
      const created = await createCategory({ name: catForm.name.trim(), color: safeColor });
      setCategories((prev) => [created, ...prev]);
      setCatForm({ name: "", color: "#D6EAF3" });
    } catch (e2) {
      const msg =
        e2?.response?.data?.errors?.[0]?.message ||
        e2?.response?.data?.message ||
        "카테고리 생성 실패";
      showError(msg);
    }
  };

  const onRenameCategory = async (c) => {
    setEditingCategory(c);
    setEditCategoryOpen(true);
  };

  const onDeleteCategory = (id) => {
    openConfirm("카테고리 삭제", "카테고리를 삭제할까요?", async () => {
      setErr("");
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setForm((p) => (p.categoryId === id ? { ...p, categoryId: "" } : p));
        loadAll();
      } catch (e) {
        showError(e?.response?.data?.message || "삭제 실패");
      }
    });
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch { }
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  const closeEditTodo = () => {
    setEditTodoOpen(false);
    setEditingTodo(null);
  };

  const closeEditCategory = () => {
    setEditCategoryOpen(false);
    setEditingCategory(null);
  };

  const onSubmitEditTodo = async (id, payload) => {
    setErr("");
    try {
      const updated = await updateTodo(id, payload);
      setTodos((prev) => {
        const shouldStay = todoMatchesFilter(updated, filter, date);
        if (!shouldStay) {
          return sortTodos(prev.filter((t) => t.id !== id));
        }
        const exists = prev.some((t) => t.id === id);
        const next = exists
          ? prev.map((t) => (t.id === id ? updated : t))
          : [updated, ...prev];
        return sortTodos(next);
      });
      closeEditTodo();
    } catch (e) {
      showError(e?.response?.data?.message || "수정 실패");
    }
  };

  const onSubmitEditCategory = async (payload) => {
    if (!editingCategory) return;
    setErr("");
    try {
      const updated = await updateCategory(editingCategory.id, payload);
      setCategories((prev) => prev.map((x) => (x.id === editingCategory.id ? updated : x)));
      setTodos((prev) =>
        prev.map((t) => {
          const catId = t.category?.id || t.categoryId;
          if (catId !== updated.id) return t;
          return { ...t, categoryId: updated.id, category: updated };
        })
      );
      closeEditCategory();
    } catch (e) {
      showError(e?.response?.data?.message || "수정 실패");
    }
  };

  const filterLabels = {
    today: "오늘",
    week: "이번 주",
    date: "날짜",
    all: "전체",
  };
  const currentFilterLabel = filterLabels[filter] || "전체";

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

        <main className="mainContent">
          <div className="mainInner">
          <div className="mainHeader">
            <div>
              <h1 className="title">Todo & 일정</h1>
              <div className="sub">오늘의 할 일과 중요한 일정을 한눈에 확인하고, 새로운 계획을 손쉽게 추가해 보세요.</div>
            </div>
          </div>

          {/* ✅ 1) 등록 섹션 (TodoForm) */}
          <section className="sectionCard">
            <div className="sectionTitle">등록</div>
            <TodoForm form={form} setForm={setForm} categories={categories} onCreateTodo={onCreateTodo} />
          </section>

          {/* ✅ 2) 조회 섹션 (FilterPanel) */}
          <section className="sectionCard">
            <div className="sectionTitle">조회</div>

            <div className="controls">
              <div className="controlsRow">
                <button className={`chip ${filter === "today" ? "active" : ""}`} onClick={() => setFilter("today")} type="button">
                  오늘
                </button>
                <button className={`chip ${filter === "week" ? "active" : ""}`} onClick={() => setFilter("week")} type="button">
                  이번 주
                </button>
                <button className={`chip ${filter === "date" ? "active" : ""}`} onClick={() => setFilter("date")} type="button">
                  날짜
                </button>
                <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")} type="button">
                  전체
                </button>
              </div>

              {filter === "date" && (
                <div className="controlsRow controlsRow--date">
                  <Input
                    label="조회 날짜"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    helper="해당 날짜 범위와 겹치는 일정이 조회됩니다."
                  />
                </div>
              )}
            </div>
          </section>



          {/* ✅ 3) 목록 섹션 (TodoList) */}
          <section className="sectionCard">
            <div className="sectionHeader">
              <div className="sectionTitle">목록 - {currentFilterLabel}</div>
              <div className="sectionMeta">{todos.length}개</div>
            </div>
            <TodoList todos={todos} onToggle={onToggle} onEditText={onEditText} onDelete={onDelete} />
          </section>

          </div>

          <EditTodoModal
            open={editTodoOpen}
            todo={editingTodo}
            categories={categories}
            onClose={closeEditTodo}
            onSubmit={onSubmitEditTodo}
          />

          <EditCategoryModal
            open={editCategoryOpen}
            initialName={editingCategory?.name || ""}
            initialColor={editingCategory?.color || ""}
            palette={CATEGORY_COLORS}
            onClose={closeEditCategory}
            onSubmit={onSubmitEditCategory}
          />
          <ErrorModal
            open={errorModal.open}
            message={errorModal.message}
            onClose={() => setErrorModal({ open: false, message: "" })}
          />

          <ConfirmModal
            open={confirmModal.open}
            title={confirmModal.title}
            message={confirmModal.message}
            onClose={closeConfirm}
            onConfirm={handleConfirm}
          />
        </main>
      </div>
    </div>
  );
}
