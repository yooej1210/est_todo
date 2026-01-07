import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { signupApi } from "../api/auth.api";
import ErrorModal from "../components/modal/ErrorModal";

export default function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [loading, setLoading] = useState(false);

  // ✅ ErrorModal 상태
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const showError = (message) =>
    setErrorModal({ open: true, message: message || "회원가입 중 문제가 발생했습니다." });
  const closeError = () => setErrorModal({ open: false, message: "" });

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await signupApi(form);
      nav("/login", { replace: true });
    } catch (e2) {
      // ✅ 서버 validation 에러까지 최대한 친절하게
      const msg =
        e2?.response?.data?.errors?.[0]?.message ||
        e2?.response?.data?.message ||
        "회원가입에 실패했습니다.";
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
          placeholder="이메일을 입력하세요."
          value={form.email}
          onChange={onChange("email")}
        />
        <Input
          label="닉네임"
          placeholder="닉네임을 입력하세요."
          value={form.nickname}
          onChange={onChange("nickname")}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={form.password}
          onChange={onChange("password")}
          helper="비밀번호는 8자 이상"
        />

        {/* ✅ 기존 err 영역 제거하고 모달만 사용 */}
        <Button disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </Button>

        <div className="footer">
          <span>이미 계정이 있나요?</span>
          <Link to="/login">로그인</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
