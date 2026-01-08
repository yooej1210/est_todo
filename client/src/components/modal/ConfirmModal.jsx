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
        <div className="modalFooterActions">
          <button
            className="outlineBtn"
            type="button"
            onClick={onClose}
          >
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
      <p className="modalMessage">
        {message}
      </p>
    </Modal>
  );
}
