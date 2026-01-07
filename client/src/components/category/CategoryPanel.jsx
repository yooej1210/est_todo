// client/src/components/category/CategoryPanel.jsx
import Input from "../Input";

export default function CategoryPanel({
  categories,
  catForm,
  setCatForm,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onLogout,
  palette, // [{ name, hex }]
}) {
  return (
    <aside className="panel side">
      <div className="header">
        <div>
          <h2 className="title">카테고리</h2>
          <div className="sub">사용자별 카테고리 관리</div>
        </div>

        {/* ✅ 로그아웃도 링크형 */}
        <button type="button" className="linkBtn" onClick={onLogout}>
          로그아웃
        </button>
      </div>

      <form className="form-card" onSubmit={onCreateCategory}>
        <Input
          label="새 카테고리"
          placeholder="예: 공부"
          value={catForm.name}
          onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
        />

        <div>
          <label style={{ fontSize: 13, fontWeight: 700 }}>색상 선택</label>

          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            {palette.map((c) => (
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
                    border: "1px solid rgba(0,0,0,0.10)",
                    marginTop: 2,
                  }}
                />

                <div style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ alignSelf: "end" }}>
          <button type="submit" className="primaryBtn">
            추가
          </button>
        </div>
      </form>

      <div className="cat-list">
        {categories.map((c) => (
          <div className="cat" key={c.id}>
            <div className="left">
              <div
                className="dot"
                style={{
                  background: c.color || "#e5e7eb",
                  border: "1px solid rgba(0,0,0,0.10)",
                }}
              />
              <div className="name">{c.name}</div>
            </div>

            {/* ✅ 수정/삭제를 링크형으로 */}
            <div className="mini">
              <button
                type="button"
                className="linkBtn"
                onClick={() => onRenameCategory(c)}
              >
                수정
              </button>
              <button
                type="button"
                className="linkBtn danger"
                onClick={() => onDeleteCategory(c.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
