import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { logoutApi } from "../api/auth.api";

export default function MainPage() {
  const nav = useNavigate();

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Main Page</h1>
      <p style={{ color: "#6b7280" }}>여기는 로그인 성공 후에만 들어올 수 있습니다.</p>
      <div style={{ width: 220 }}>
        <Button onClick={logout}>로그아웃</Button>
      </div>
    </div>
  );
}
