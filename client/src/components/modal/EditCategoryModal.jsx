import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

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
            form="editCategoryForm"
            className="primaryBtn"
            style={{ flex: 1 }}
          >
            저장
          </button>
        </div>
      }

      

    >
      <form id="editCategoryForm" onSubmit={handleSubmit}>
        <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 8 }}>
          카테고리 이름
        </label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 공부"
          autoFocus
        />

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
            색상 선택
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {palette.map((p) => (
              <label
                key={p.hex}
                style={{
                  display: "flex",
                  gap: 10,
                  cursor: "pointer",
                  alignItems: "center",
                  padding: "8px 10px",
                  border: color === p.hex ? "1px solid rgba(91,124,255,0.7)" : "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <input
                  type="radio"
                  name="editCategoryColor"
                  checked={color === p.hex}
                  onChange={() => setColor(p.hex)}
                />

                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: p.hex,
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                />

                <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="helper" style={{ marginTop: 10 }}>
          ESC로 닫기, Enter로 저장
        </div>
      </form>
    </Modal>
  );
}
