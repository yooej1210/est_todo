import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginApi } from "../api/auth.api";
import ErrorModal from "../components/modal/ErrorModal";

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ✅ ErrorModal 상태
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const showError = (message) =>
    setErrorModal({ open: true, message: message || "로그인 중 문제가 발생했습니다." });
  const closeError = () => setErrorModal({ open: false, message: "" });

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginApi(form);

      const accessToken = data.accessToken || data.token || data?.data?.accessToken;
      if (!accessToken) {
        showError("토큰이 응답에 없습니다.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      nav("/", { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.errors?.[0]?.message ||
        e2?.response?.data?.message ||
        e2?.message ||
        "로그인에 실패했습니다.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* ✅ 에러 모달 */}
      <ErrorModal
        open={errorModal.open}
        title="오류"
        message={errorModal.message}
        onClose={closeError}
      />

      <form className="form" onSubmit={onSubmit}>
        <Input
          label="이메일"
          placeholder="아이디를 입력하세요."
          value={form.email}
          onChange={onChange("email")}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={form.password}
          onChange={onChange("password")}
        />

        {/* ✅ 기존 err 영역 제거하고 모달만 사용 */}
        <Button disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>

        <div className="footer">
          <Link to="/signup">회원가입하기</Link>
          <a href="#" onClick={(e) => e.preventDefault()}>
            비밀번호 찾기
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
