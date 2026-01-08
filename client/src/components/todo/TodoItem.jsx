import { getCategoryColorClass } from "../../constants/categoryColors";

function fmtShort(dt, isAllDay = false) {
  if (!dt) return "-";
  const d = new Date(dt);

  // 하루종일이면 날짜만 표시
  if (isAllDay) {
    return d.toLocaleDateString("ko-KR");
  }

  // 일반 일정이면 날짜 + 시간
  return d.toLocaleString("ko-KR");
}

export default function TodoItem({ t, onToggle, onEditText, onDelete }) {
  const color = t?.category?.color || "#e5e7eb";
  const catName = t?.category?.name || "미분류";
  const colorClass = getCategoryColorClass(color);

  const metaParts = [];

  if (t.startDate) {
    metaParts.push(`시작 ${fmtShort(t.startDate, t.isAllDay)}`);
  }

  if (t.endDate) {
    metaParts.push(`종료 ${fmtShort(t.endDate, t.isAllDay)}`);
  }

  if (t.isAllDay) {
    metaParts.push("하루종일");
  }

  return (
    <div className={`todo-item ${t.isCompleted ? "done" : ""}`}>
      <div className="left">
        <div className="title-row">
          <span className={`dot ${colorClass}`} />
          <div className="main">{t.text}</div>

          {t.isCompleted ? (
            <span className="badge done">완료</span>
          ) : (
            <span className="badge open">진행중</span>
          )}
        </div>

        <div className="meta-row">
          <span className={`pill ${colorClass}`}>
            #{catName}
          </span>

          {metaParts.length > 0 && (
            <span className="meta">{metaParts.join(" · ")}</span>
          )}
        </div>
      </div>

      <div className="actions">
        <button
          className="linkBtn iconBtn"
          type="button"
          onClick={() => onToggle(t.id)}
        >
          {t.isCompleted ? "미완료" : "완료"}
        </button>

        <button
          className="linkBtn iconBtn"
          type="button"
          onClick={() => onEditText(t)}
        >
          수정
        </button>

        <button
          className="linkBtn danger iconBtn"
          type="button"
          onClick={() => onDelete(t.id)}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
