export default function Input({ label, error, helper, ...props }) {
  return (
    <div className="row">
      {label && <label style={{ fontSize: 13, fontWeight: 700 }}>{label}</label>}
      <input className="input" {...props} />
      {error ? <div className="error">{error}</div> : helper ? <div className="helper">{helper}</div> : null}
    </div>
  );
}
