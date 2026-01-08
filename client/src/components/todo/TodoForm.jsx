// client/src/components/todo/TodoForm.jsx
import Input from "../Input";
import Button from "../Button";

export default function TodoForm({
  form,
  setForm,
  categories,
  onCreateTodo,
}) {
  return (
    <form className="form-card" onSubmit={onCreateTodo}>
      <Input
        label="할 일 / 일정 내용"
        placeholder="예: 과제 제출 / 회의 준비"
        value={form.text}
        onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
      />

      <div className="two">
        <div>
          <label className="formLabel">카테고리</label>
          <select
            className="input"
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
          >
            <option value="">(선택 안 함)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="helper">카테고리는 사용자 본인 것만 사용됩니다.</div>
        </div>

        <div className="inline">
          <label className="check">
            <input
              type="checkbox"
              checked={form.isAllDay}
              onChange={(e) => setForm((p) => ({ ...p, isAllDay: e.target.checked }))}
            />
            하루종일
          </label>

          <div className="formAction">
            <Button>등록</Button>
          </div>
        </div>
      </div>

      <div className="two">
        <Input
          label="시작일시"
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
          helper={form.isAllDay ? "하루종일이면 이 값의 날짜로 00:00~23:59 저장" : ""}
        />
        <Input
          label="종료일시"
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
          helper={form.isAllDay ? "하루종일이면 종료일시는 서버에서 자동 설정" : ""}
        />
      </div>

    </form>
  );
}
