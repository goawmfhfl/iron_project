"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { useModalStore } from "@/lib/stores/modal-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatEventDate } from "@/lib/utils/date";
import type { Socialing } from "@/lib/types/socialing";

interface SocialingApplyFormProps {
  socialingId: string;
  socialing: Socialing | null;
}

export function SocialingApplyForm({ socialingId, socialing }: SocialingApplyFormProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [paymentAgreed, setPaymentAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/socialing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialing_id: socialingId,
          question_answer: questionAnswer,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "신청 제출에 실패했습니다.");
      }

      openModal({
        type: "CUSTOM",
        title: "신청 완료",
        message:
          "참여 신청이 완료되었습니다. 담당자가 확인 후, 안내 메시지를 드립니다.",
        primaryAction: {
          label: "확인",
          onClick: () => {
            closeModal();
            router.back();
          },
        },
      });
    } catch (err) {
      openModal({
        type: "CUSTOM",
        title: "신청 실패",
        message:
          err instanceof Error
            ? err.message
            : "신청 제출에 실패했습니다. 잠시 후 다시 시도해주세요.",
        primaryAction: {
          label: "확인",
          onClick: () => closeModal(),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventDateText = socialing?.eventDate
    ? formatEventDate(socialing.eventDate)
    : null;
  const feeText =
    socialing?.participationFee != null
      ? `${socialing.participationFee.toLocaleString("ko-KR")}원`
      : "무료";
  const questionText = socialing?.question?.trim();

  const profileImage =
    (user?.user_metadata?.profile_image as string | undefined) ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    null;

  const accountInfo = "3333-15-8255-698 카카오뱅크 최재영";

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(accountInfo);
      setAccountCopied(true);
      setTimeout(() => setAccountCopied(false), 2000);
    } catch (err) {
      console.error("계좌 정보 복사 실패:", err);
    }
  };

  return (
    <Card elevation={1}>
      {step === 1 && (
        <>
          <CardContent className="space-y-6 pt-8 pb-8">
            {/* 상단 안내 타이틀 */}
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Notice
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-snug">
                모두가 즐거운 모임이 될 수 있도록
                <br />
                <span className="text-primary-600">꼭 확인해주세요!</span>
              </h2>
            </div>

            {/* 안내사항 카드 */}
            <div className="rounded-2xl border border-border bg-surface-elevated/80 p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                  1
                </div>
                <p className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-text-secondary text-left">
                  모임 시작 전 부득이하게 참여가 어려워진 경우, 안내 받았던 카톡 채널로 미리
                  알려주세요.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                  2
                </div>
                <p className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-text-secondary text-left">
                  무단으로 불참하거나 함께하는 멤버들에게 피해를 주는 경우 이용 제제를 받게
                  돼요.
                </p>
              </div>
            </div>

            {/* 동의 체크 영역 */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated/60 px-4 py-3">
              <div className="flex-shrink-0 flex items-center h-5 relative">
                <input
                  type="checkbox"
                  id="rulesAccepted"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-2 appearance-none bg-white checked:bg-primary-600 checked:border-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-border hover:border-primary-400 accent-primary-600 scale-110"
                />
              </div>
              <label
                htmlFor="rulesAccepted"
                className="min-w-0 flex-1 text-sm sm:text-base text-text-primary cursor-pointer leading-relaxed text-left"
              >
                소셜링 이용 규칙을 잘 지키겠습니다.
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!rulesAccepted}
                className="px-8 py-3 text-sm sm:text-base font-semibold rounded-xl"
              >
                다음
              </Button>
            </div>
          </CardContent>
        </>
      )}

      {step === 2 && (
        <>
          <CardHeader>
            <h2 className="text-xl font-bold text-text-primary">호스트의 질문</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-elevated border border-border flex items-center justify-center text-lg font-semibold text-text-primary">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="프로필 이미지"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <span>{user?.email?.[0]?.toUpperCase() ?? "U"}</span>
                )}
              </div>
              <div className="flex-1 text-sm text-text-secondary whitespace-pre-wrap">
                {questionText || "호스트가 별도의 질문을 남기지 않았습니다."}
              </div>
            </div>
            <div>
              <Textarea
                value={questionAnswer}
                onChange={(e) => setQuestionAnswer(e.target.value)}
                placeholder="질문에 대한 답변을 5글자 이상 작성해주세요."
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6 py-2 text-sm font-semibold"
              >
                이전
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={questionAnswer.trim().length < 5}
                className="px-6 py-2 text-sm font-semibold"
              >
                다음
              </Button>
            </div>
          </CardContent>
        </>
      )}

      {step === 3 && (
        <>
          <CardHeader>
            <h2 className="text-xl font-bold text-text-primary">결제 안내</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 소셜링 정보 - 모던한 디자인 */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-surface-elevated/80 to-surface-elevated/40 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  소셜링 정보
                </p>
              </div>
              {socialing && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary leading-tight">
                      {socialing.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    {eventDateText && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <svg
                          className="w-4 h-4 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{eventDateText}</span>
                      </div>
                    )}
                    {socialing.location && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <svg
                          className="w-4 h-4 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{socialing.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 입금 계좌 - 복사 기능 포함 */}
            <div className="rounded-xl border border-border bg-surface-elevated/60 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
                    입금 계좌
                  </p>
                  <p className="text-base font-mono text-text-primary">{accountInfo}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="flex-shrink-0 px-4 py-2 rounded-lg border border-border bg-surface-elevated hover:bg-surface-elevated/80 active:scale-95 transition-all text-sm font-medium text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accountCopied ? (
                    <span className="flex items-center gap-2 text-primary-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      복사됨
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      복사
                    </span>
                  )}
                </button>
              </div>
              {socialing && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-text-tertiary mb-1">참가비</p>
                  <p className="text-lg font-bold text-text-primary">{feeText}</p>
                </div>
              )}
            </div>

            {/* 입금 안내 섹션 */}
            <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-text-primary">
                    입금 안내
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    입금 계좌로 입금하신 다음에 신청 버튼을 눌러주세요.
                    <br />
                    입금된 것을 확인한 후에 승인 여부를 결정할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 참가비 환불 규정 안내 */}
            <div className="rounded-xl border border-border bg-surface-elevated/60 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  참가비 환불 규정 안내
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>결제 후 30분 경과 전: 전액 환불</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>참여 거절되거나 승인 후 내보내진 경우: 전액 환불</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>참여 확정 모임의 진행일 기준 3일 전부터: 환불 불가</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>모임 진행 당일에 신청한 경우: 환불 불가</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated/80 px-4 py-3">
              <div className="flex-shrink-0 flex items-center h-5 relative">
                <input
                  type="checkbox"
                  id="paymentAgreed"
                  checked={paymentAgreed}
                  onChange={(e) => setPaymentAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-2 appearance-none bg-white checked:bg-primary-600 checked:border-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-border hover:border-primary-400 accent-primary-600 scale-110"
                />
              </div>
              <label
                htmlFor="paymentAgreed"
                className="min-w-0 flex-1 text-sm sm:text-base text-text-primary cursor-pointer leading-relaxed text-left"
              >
                결제 내용, 환불 규정을 모두 확인했으며 이에 동의합니다.
              </label>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="px-6 py-2 text-sm font-semibold"
              >
                이전
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-semibold"
                disabled={!paymentAgreed || isSubmitting}
              >
                {isSubmitting ? "처리 중..." : "제출하기"}
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

