import Modal from "./Modal";

export default function ConfirmModal({
  open,
  title = "확인",
  message = "",
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="linkBtn" type="button" onClick={onClose}>
            취소
          </button>
          <button
            className="primaryBtn"
            type="button"
            onClick={() => onConfirm?.()}
          >
            확인
          </button>
        </div>
      }
    >
      <p style={{ margin: 0, color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
        {message}
      </p>
    </Modal>
  );
}
