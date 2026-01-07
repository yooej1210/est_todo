import Modal from "./Modal";

export default function ErrorModal({ open, title = "오류", message, onClose }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      variant="error"   // ⭐ 여기
      footer={
        <button className="primaryBtn" type="button" onClick={onClose}>
          확인
        </button>
      }
    >
      <p
        style={{
          margin: 0,
          color: "#374151",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {message || "문제가 발생했습니다."}
      </p>
    </Modal>
  );
}
