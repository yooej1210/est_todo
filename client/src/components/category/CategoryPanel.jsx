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
          <h2 className="title">移댄뀒怨좊━</h2>
          <div className="sub">?ъ슜?먮퀎 移댄뀒怨좊━ 愿由?/div>
        </div>

        {/* ??濡쒓렇?꾩썐??留곹겕??*/}
        <button type="button" className="linkBtn" onClick={onLogout}>
          濡쒓렇?꾩썐
        </button>
      </div>

      <form className="form-card" onSubmit={onCreateCategory}>
        <Input
          label="??移댄뀒怨좊━"
          placeholder="?? 怨듬?"
          value={catForm.name}
          onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
        />

        <div>
          <label style={{ fontSize: 13, fontWeight: 700 }}>?됱긽 ?좏깮</label>

          <div className="color-list">
            {palette.map((c) => (
              <label
                key={c.hex}
                className="color-item"\r\n                style={{\r\n                  border:
                    catForm.color === c.hex
                      ? "1px solid rgba(91,124,255,0.7)"
                      : "1px solid #e5e7eb",                }}
              >
                <input
                  type="radio"
                  name="categoryColor"
                  checked={catForm.color === c.hex}
                  onChange={() => setCatForm((p) => ({ ...p, color: c.hex }))}
                  className="color-radio"
                />

                <div className="color-swatch" style={{ background: c.hex }} />

                <div className="color-name">{c.name}</div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ alignSelf: "end" }}>
          <button type="submit" className="primaryBtn">
            異붽?
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

            {/* ???섏젙/??젣瑜?留곹겕?뺤쑝濡?*/}
            <div className="mini">
              <button
                type="button"
                className="linkBtn"
                onClick={() => onRenameCategory(c)}
              >
                ?섏젙
              </button>
              <button
                type="button"
                className="linkBtn danger"
                onClick={() => onDeleteCategory(c.id)}
              >
                ??젣
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

