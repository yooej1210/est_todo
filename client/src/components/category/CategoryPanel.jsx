// client/src/components/category/CategoryPanel.jsx
import Input from "../Input";
import { getCategoryColorClass } from "../../constants/categoryColors";

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
      <div className="sideHeader">
        <div className="sideTitleGroup">
          <h2 className="sideTitle">카테고리</h2>
          <div className="sideSub">사용자별 카테고리 관리</div>
        </div>

        <button type="button" className="linkBtn sideLogout" onClick={onLogout}>
          로그아웃
        </button>
      </div>

      <form className="form-card categoryForm" onSubmit={onCreateCategory}>
        <Input
          label="새 카테고리"
          placeholder="예: 공부"
          value={catForm.name}
          onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
        />

        <div className="categoryColor">
          <label className="formLabel">색상 선택</label>

          <div className="colorGrid">
            {palette.map((c) => {
              const colorClass = getCategoryColorClass(c.hex);
              return (
                <label
                  key={c.hex}
                  className={`colorOption ${catForm.color === c.hex ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="categoryColor"
                    checked={catForm.color === c.hex}
                    onChange={() => setCatForm((p) => ({ ...p, color: c.hex }))}
                  />

                  <span className={`colorSwatch ${colorClass}`} />
                  <span className="colorName">{c.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="categoryActions">
          <button type="submit" className="primaryBtn categoryAddBtn">
            + 카테고리 추가
          </button>
        </div>
      </form>

      <div className="cat-list">
        {categories.map((c) => {
          const colorClass = getCategoryColorClass(c.color);
          return (
            <div className="cat" key={c.id}>
              <div className="left">
                <div className={`dot ${colorClass}`} />
                <div className="name">{c.name}</div>
              </div>

              <div className="mini">
                <button
                  type="button"
                  className="linkBtn iconBtn"
                  onClick={() => onRenameCategory(c)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="linkBtn danger iconBtn"
                  onClick={() => onDeleteCategory(c.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

