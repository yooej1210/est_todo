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
            className="outlineBtn"
            type="button"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            취소
          </button>
          <button
            className="primaryBtn"
            type="button"
            onClick={() => onConfirm?.()}
            style={{ flex: 1 }}
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
