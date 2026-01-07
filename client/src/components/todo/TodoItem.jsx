import Button from "../Button";

function fmtShort(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function TodoItem({ t, onToggle, onEditText, onDelete }) {
  const color = t?.category?.color || "#e5e7eb";
  const catName = t?.category?.name || "미분류";

  return (
    <div className={`todo-item ${t.isCompleted ? "done" : ""}`}>
      <div className="left">
        <div className="title-row">
          <span className="dot" style={{ background: color }} />
          <div className="main">{t.text}</div>

          {t.isCompleted ? (
            <span className="badge done">완료</span>
          ) : (
            <span className="badge open">진행중</span>
          )}
        </div>

        <div className="meta-row">
          <span className="pill" style={{ borderColor: color, color }}>
            #{catName}
          </span>
          <span className="meta">
            시작 {fmtShort(t.startDate)} · 종료 {fmtShort(t.endDate)} · 하루종일{" "}
            {t.isAllDay ? "Y" : "N"}
          </span>
        </div>
      </div>

      <div className="actions">
        <button className="linkBtn" type="button" onClick={() => onToggle(t.id)}>
          {t.isCompleted ? "미완료" : "완료"}
        </button>
        <button className="linkBtn" type="button" onClick={() => onEditText(t)}>
          수정
        </button>
        <button className="linkBtn danger" type="button" onClick={() => onDelete(t.id)}>
          삭제
        </button>
      </div>
    </div>
  );
}
