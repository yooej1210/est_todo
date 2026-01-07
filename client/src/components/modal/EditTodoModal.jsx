import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

function toDatetimeLocalValue(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EditTodoModal({
  open,
  todo, // ✅ { id, text, categoryId, isAllDay, startDate, endDate, category? }
  categories = [],
  onClose,
  onSubmit, // ✅ (id, payload) => Promise<void>
}) {
  const initialCategoryId = useMemo(() => {
    // 서버 응답이 categoryId를 안 주고 category만 주는 케이스 방어
    return todo?.categoryId || todo?.category?.id || "";
  }, [todo]);

  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(""); // datetime-local string
  const [endDate, setEndDate] = useState("");     // datetime-local string

  useEffect(() => {
    if (!open) return;
    setText(todo?.text || "");
    setCategoryId(initialCategoryId || "");
    setIsAllDay(!!todo?.isAllDay);
    setStartDate(toDatetimeLocalValue(todo?.startDate));
    setEndDate(toDatetimeLocalValue(todo?.endDate));
  }, [open, todo, initialCategoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = text.trim();
    if (!v) return;

    const payload = {
      text: v,
      categoryId: categoryId ? categoryId : null,
      isAllDay: !!isAllDay,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    await onSubmit(todo.id, payload);
  };

  return (
    <Modal
      open={open}
      title="할 일 수정"
      onClose={onClose}
      footer={
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            marginTop: 8,
            width: "100%",
          }}
        >
          <button
            type="button"
            className="outlineBtn"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            취소
          </button>

          <button
            type="submit"
            form="editTodoForm"
            className="primaryBtn"
            style={{ flex: 1 }}
          >
            저장
          </button>
        </div>
      }

    >
      <form id="editTodoForm" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {/* text */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>
            내용
          </label>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="할 일 / 일정 내용"
            autoFocus
          />
          <div className="helper" style={{ marginTop: 8 }}>
            Enter로 저장, ESC로 닫기
          </div>
        </div>

        {/* category + allDay */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>
              카테고리
            </label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">(선택 안 함)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <label className="check" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
              하루종일
            </label>
          </div>
        </div>

        {/* start/end */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>
              시작일시
            </label>
            <input
              className="input"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>
              종료일시
            </label>
            <input
              className="input"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isAllDay} // ✅ 하루종일이면 종료는 서버 자동 처리라 막는 게 UX 좋음
            />
            {isAllDay && (
              <div className="helper" style={{ marginTop: 6 }}>
                하루종일이면 종료일시는 서버에서 자동 설정돼요.
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
