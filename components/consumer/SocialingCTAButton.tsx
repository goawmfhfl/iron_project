"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/lib/stores/modal-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

interface SocialingCTAButtonProps {
  socialingId: string;
}

export function SocialingCTAButton({ socialingId }: SocialingCTAButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { openModal, closeModal } = useModalStore();
  const { shouldHide } = useScrollDirection({ threshold: 50 });

  const handleClick = () => {
    const applyPath = `/social/${socialingId}/apply`;

    if (loading) {
      openModal({
        type: "CUSTOM",
        title: "잠시만요",
        message: "로그인 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.",
        primaryAction: {
          label: "확인",
          onClick: () => closeModal(),
        },
      });
      return;
    }

    if (!user) {
      openModal({
        type: "CUSTOM",
        title: "로그인 필요",
        message: "소셜링 신청은 회원만 가능합니다. 로그인 후 다시 시도해주세요.",
        primaryAction: {
          label: "로그인하기",
          onClick: () => {
            closeModal();
            router.push(`/login?redirect=${encodeURIComponent(applyPath)}`);
          },
        },
        secondaryAction: {
          label: "닫기",
          onClick: () => closeModal(),
        },
      });
      return;
    }

    router.push(applyPath);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border p-4 sm:p-6 transition-transform duration-300 ease-in-out",
        shouldHide ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          onClick={handleClick}
          className="w-full py-4 text-lg font-semibold"
          size="lg"
        >
          신청하기
        </Button>
      </div>
    </div>
  );
}
