import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { signupApi } from "../api/auth.api";

export default function SignupPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", nickname: "" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        // ✅ 프론트에서 먼저 검증 (백엔드와 동일: 8자 이상)
        if (form.password.length < 8) {
            setErr("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        try {
            await signupApi(form);
            nav("/login", { replace: true });
        } catch (e2) {
            // 서버가 errors 배열로 주는 경우도 같이 처리
            const msg =
                e2?.response?.data?.errors?.[0]?.message ||
                e2?.response?.data?.message ||
                "회원가입에 실패했습니다.";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout>
            <form className="form" onSubmit={onSubmit}>
                <Input label="이메일" placeholder="이메일을 입력하세요." value={form.email} onChange={onChange("email")} />
                <Input label="닉네임" placeholder="닉네임을 입력하세요." value={form.nickname} onChange={onChange("nickname")} />
                <Input
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력하세요."
                    value={form.password}
                    onChange={onChange("password")}
                    helper="비밀번호는 8자 이상"
                />
                {err && <div className="error">{err}</div>}
                <Button disabled={loading}>{loading ? "처리 중..." : "회원가입"}</Button>

                <div className="footer">
                    <span>이미 계정이 있나요?</span>
                    <Link to="/login">로그인</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
