"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useLogin, LoginError } from "@/lib/hooks/useLogin";
import { validateEmail, validatePassword } from "@/lib/utils/validation";

const REMEMBERED_EMAIL_KEY = "ironProject_remembered_email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // redirect 파라미터 읽기
  const redirectPath = searchParams.get("redirect");
  const loginMutation = useLogin(redirectPath || undefined);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberEmail, setRememberEmail] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 회원가입 성공 메시지 표시
    if (searchParams.get("signup") === "success") {
      setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
    }

    // 로컬스토리지에서 저장된 이메일 불러오기
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) {
        setFormData((prev) => ({ ...prev, email: rememberedEmail }));
        setRememberEmail(true);
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 필드 변경 시 해당 필드의 에러 제거
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // 에러 메시지도 제거
    if (error) {
      setError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // 로그인 성공 시 아이디 기억하기 처리
      if (typeof window !== "undefined") {
        if (rememberEmail) {
          // 체크박스가 체크된 경우 로컬스토리지에 저장
          localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email);
        } else {
          // 체크박스가 해제된 경우 로컬스토리지에서 삭제
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }

      // onSuccess에서 리다이렉션을 처리하지만, 혹시 모를 경우를 대비해 여기서도 확인
      // onSuccess가 먼저 실행되므로 여기는 백업용
    } catch (err) {
      if (err instanceof LoginError) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card elevation={2}>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-text-primary">
              로그인
            </h1>
            <p className="text-center text-sm text-text-secondary mt-2">
              ironProject에 다시 오신 것을 환영합니다
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <div className="p-3 rounded-lg bg-success-light border border-success text-success text-sm">
                  {successMessage}
                </div>
              )}

              <Input
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                placeholder="example@email.com"
                autoComplete="email"
              />

              <Input
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                required
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />

              <Checkbox
                label="아이디 기억하기"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />

              {error && (
                <div className="p-3 rounded-lg bg-error-light border border-error text-error text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-text-secondary">
                계정이 없으신가요?{" "}
                <Link
                  href="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <Card elevation={2}>
            <CardContent className="py-12">
              <div className="text-center text-text-secondary">로딩 중...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

