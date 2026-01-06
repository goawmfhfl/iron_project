"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface SocialingCTAButtonProps {
  socialingId: string;
}

export function SocialingCTAButton({ socialingId }: SocialingCTAButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/social/${socialingId}/apply`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border p-4 sm:p-6">
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
