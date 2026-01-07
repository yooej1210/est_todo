export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-left">
          <h2 className="title">지금 로그인하고<br />최적의 환경을 경험하세요.</h2>
          <div className="sub">Todo & 일정 관리 서비스</div>
          <div className="mock" />
        </div>

        <div className="auth-right">
          <div className="brand">
            <div className="logo">🅿️</div>
            <div className="name">Plan</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
