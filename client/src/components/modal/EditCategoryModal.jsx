import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { getCategoryColorClass } from "../../constants/categoryColors";

export default function EditCategoryModal({
  open,
  initialName = "",
  initialColor = "",
  palette = [], // [{ name, hex }]
  onClose,
  onSubmit, // (payload: { name, color }) => Promise<void>
}) {
  const defaultColor = useMemo(() => {
    // initialColor가 팔레트에 있으면 유지, 아니면 첫 번째(또는 Blue)로
    const exists = palette.some((p) => p.hex === initialColor);
    if (exists) return initialColor;
    const blue = palette.find((p) => p.name.toLowerCase().includes("blue"));
    return blue?.hex || palette[0]?.hex || "#D6EAF3";
  }, [initialColor, palette]);

  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(defaultColor);

  useEffect(() => {
    if (!open) return;
    setName(initialName || "");
    setColor(defaultColor);
  }, [open, initialName, defaultColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    const allowed = palette.some((p) => p.hex === color);
    const safeColor = allowed ? color : defaultColor;
    await onSubmit({ name: v, color: safeColor });
  };

  return (
    <Modal
      open={open}
      title="카테고리 수정"
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
            form="editCategoryForm"
            className="primaryBtn"
          >
            저장
          </button>
        </div>
      }
    >
      <form id="editCategoryForm" onSubmit={handleSubmit} className="modalForm">
        <div className="modalField">
          <label className="modalLabel">
            카테고리 이름
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 공부"
            autoFocus
          />
        </div>

        <div className="modalSection">
          <div className="modalLabel">색상 선택</div>

          <div className="colorGrid colorGrid--compact">
            {palette.map((p) => {
              const colorClass = getCategoryColorClass(p.hex);
              return (
                <label
                  key={p.hex}
                  className={`colorOption colorOption--compact ${color === p.hex ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="editCategoryColor"
                    checked={color === p.hex}
                    onChange={() => setColor(p.hex)}
                  />

                  <span className={`colorSwatch ${colorClass}`} />
                  <span className="colorName">{p.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="helper modalHelper">
          ESC로 닫기, Enter로 저장
        </div>
      </form>
    </Modal>
  );
}
