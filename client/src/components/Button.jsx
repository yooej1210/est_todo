export default function Button({ variant = "solid", ...props }) {
  const cls = variant === "ghost" ? "btn btn--ghost" : "btn";
  return <button className={cls} {...props} />;
}
