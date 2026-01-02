"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card elevation={2}>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-text-primary">
              이메일 인증이 필요합니다
            </h1>
            <p className="text-center text-sm text-text-secondary mt-2">
              회원가입이 완료되었습니다
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-text-primary">
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {email || "등록하신 이메일"}
                </span>
                <br />
                로 인증 메일을 발송했습니다.
              </p>

              <div className="bg-surface-elevated rounded-lg p-4 space-y-3">
                <p className="text-sm text-text-secondary leading-relaxed">
                  이메일에서 <strong className="text-text-primary">인증 확인 버튼</strong>을
                  <br />
                  클릭하시면 바로 로그인하실 수 있습니다.
                </p>
                <p className="text-sm text-text-tertiary">
                  이메일이 보이지 않으신가요?
                  <br />
                  스팸함을 확인해주세요.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-elevated">
              <Button
                className="w-full"
                size="lg"
              >
                <Link href="/login">로그인 페이지로 이동</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-text-secondary">
                이미 인증을 완료하셨나요?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  로그인하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
          <div className="w-full max-w-md">
            <Card elevation={2}>
              <CardContent className="py-12">
                <div className="text-center text-text-secondary">로딩 중...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

