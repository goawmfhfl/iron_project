"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/lib/stores/modal-store";

interface SocialingApplyFormProps {
  socialingId: string;
}

export function SocialingApplyForm({ socialingId }: SocialingApplyFormProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/socialing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialing_id: socialingId,
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

  return (
    <Card elevation={1}>
      <CardHeader>
        <h2 className="text-xl font-bold text-text-primary">소셜링 신청</h2>
        <p className="mt-2 text-sm text-text-secondary">
          회원가입 시 입력한 정보를 기반으로 신청이 진행됩니다. 아래 버튼을 눌러
          신청을 완료해주세요.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-3 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "신청 중..." : "신청하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

