export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  variant, 
}) {
  if (!open) return null;

  const isError = variant === "error";

  return (
    <div
      className={`modalOverlay ${isError ? "modalOverlay--error" : ""}`}
      onClick={onClose}
    >
      <div
        className={`modalCard ${isError ? "modalCard--error" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="modalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modalBody">{children}</div>

        {footer && <div className="modalFooter">{footer}</div>}
      </div>
    </div>
  );
}
