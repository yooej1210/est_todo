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

function toDateValue(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// yyyy-mm-dd -> ISO (local 기준으로 하루 시작/끝)
function dateToISOStart(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const local = new Date(y, m - 1, d, 0, 0, 0, 0);
  return local.toISOString();
}

function dateToISOEnd(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const local = new Date(y, m - 1, d, 23, 59, 59, 999);
  return local.toISOString();
}

export default function EditTodoModal({
  open,
  todo, // { id, text, categoryId, isAllDay, startDate, endDate, category? }
  categories = [],
  onClose,
  onSubmit, // (id, payload) => Promise<void>
}) {
  const initialCategoryId = useMemo(() => {
    return todo?.categoryId || todo?.category?.id || "";
  }, [todo]);

  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);

  // ✅ allDay=false: datetime-local / allDay=true: date
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!open) return;

    setText(todo?.text || "");
    setCategoryId(initialCategoryId || "");
    setIsAllDay(!!todo?.isAllDay);

    if (todo?.isAllDay) {
      setStartDate(toDateValue(todo?.startDate));
      setEndDate(toDateValue(todo?.endDate));
    } else {
      setStartDate(toDatetimeLocalValue(todo?.startDate));
      setEndDate(toDatetimeLocalValue(todo?.endDate));
    }
  }, [open, todo, initialCategoryId]);

  // ✅ 체크박스 토글 시 값 포맷도 같이 변환
  const handleToggleAllDay = (checked) => {
    // 현재 입력값을 Date로 해석해서 포맷만 바꿔줌
    if (checked) {
      // datetime-local -> date
      setStartDate(startDate ? toDateValue(new Date(startDate)) : "");
      setEndDate(endDate ? toDateValue(new Date(endDate)) : "");
    } else {
      // date -> datetime-local (기본 09:00 같은 걸 원하면 여기서 설정 가능)
      if (startDate) {
        const [y, m, d] = startDate.split("-").map(Number);
        const local = new Date(y, m - 1, d, 9, 0, 0, 0);
        setStartDate(toDatetimeLocalValue(local));
      } else {
        setStartDate("");
      }

      if (endDate) {
        const [y, m, d] = endDate.split("-").map(Number);
        const local = new Date(y, m - 1, d, 18, 0, 0, 0);
        setEndDate(toDatetimeLocalValue(local));
      } else {
        setEndDate("");
      }
    }

    setIsAllDay(checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = text.trim();
    if (!v) return;

    const payload = {
      text: v,
      categoryId: categoryId ? categoryId : null,
      isAllDay: !!isAllDay,
      startDate: null,
      endDate: null,
    };

    if (isAllDay) {
      // ✅ 날짜만 입력 -> 하루 시작/끝으로 ISO 생성
      payload.startDate = startDate ? dateToISOStart(startDate) : null;

      // 옵션 A) 종료도 클라이언트에서 만들어서 보냄
      payload.endDate = endDate ? dateToISOEnd(endDate) : (startDate ? dateToISOEnd(startDate) : null);

      // 옵션 B) 서버가 종료 자동처리면 아래처럼 endDate를 null로 보내도 됨
      // payload.endDate = null;
    } else {
      // ✅ datetime-local -> ISO
      payload.startDate = startDate ? new Date(startDate).toISOString() : null;
      payload.endDate = endDate ? new Date(endDate).toISOString() : null;
    }

    await onSubmit(todo.id, payload);
  };

  return (
    <Modal
      open={open}
      title="할 일 수정"
      onClose={onClose}
      footer={
        <div className="modalFooterActions">
          <button
            type="button"
            className="outlineBtn"
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="submit"
            form="editTodoForm"
            className="primaryBtn"
          >
            저장
          </button>
        </div>
      }
    >
      <form id="editTodoForm" onSubmit={handleSubmit} className="modalForm">
        {/* text */}
        <div className="modalField">
          <label className="modalLabel">
            내용
          </label>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="할 일 / 일정 내용"
            autoFocus
          />
          <div className="helper modalHelper">
            Enter로 저장, ESC로 닫기
          </div>
        </div>

        {/* category + allDay */}
        <div className="modalFormRow modalFormRow--split">
          <div className="modalField">
            <label className="modalLabel">
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

          <div className="modalCheckWrap">
            <label className="check modalCheck">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => handleToggleAllDay(e.target.checked)}
              />
              하루종일
            </label>
          </div>
        </div>

        {/* start/end */}
        <div className="modalFormRow modalFormRow--two">
          <div className="modalField">
            <label className="modalLabel">
              {isAllDay ? "시작일" : "시작일시"}
            </label>

            <input
              className="input"
              type={isAllDay ? "date" : "datetime-local"}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="modalField">
            <label className="modalLabel">
              {isAllDay ? "종료일" : "종료일시"}
            </label>

            <input
              className="input"
              type={isAllDay ? "date" : "datetime-local"}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            {isAllDay && (
              <div className="helper modalHelper modalHelper--tight">
                하루종일이면 시간은 저장되지 않고 날짜 기준으로 처리돼요.
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
