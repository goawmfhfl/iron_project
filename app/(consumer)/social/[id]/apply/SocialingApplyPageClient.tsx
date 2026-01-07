"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { SocialingApplyForm } from "./SocialingApplyForm";
import { useAuth } from "@/components/auth/AuthProvider";
import type { FormDatabaseType } from "@/lib/types/notion-form";

interface SocialingApplyPageClientProps {
  socialingId: string;
  formDatabaseType?: FormDatabaseType;
  socialingCoverImage?: string | null; // 소셜링 coverImage (fallback용)
}

export function SocialingApplyPageClient({
  socialingId,
  formDatabaseType = "DORAN_BOOK",
  socialingCoverImage = null,
}: SocialingApplyPageClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 로그인 여부 확인 및 비로그인 사용자 차단
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const currentPath = `/social/${socialingId}/apply`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [user, authLoading, router, socialingId]);

  // 로그인 대기 중이거나 비로그인 사용자는 로딩 표시
  if (authLoading || !user) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-text-secondary">로그인 확인 중...</p>
        </CardContent>
      </Card>
    );
  }

  // coverImage fallback 로직: 현재는 폼 스키마 대신 소셜링 coverImage만 사용
  const coverImage = socialingCoverImage;

  return (
    <div className="space-y-6">
      {coverImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={coverImage}
            alt="폼 썸네일"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <SocialingApplyForm
        socialingId={socialingId}
      />
    </div>
  );
}
