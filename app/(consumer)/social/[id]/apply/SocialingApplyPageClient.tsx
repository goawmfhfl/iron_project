"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { SocialingApplyForm } from "./SocialingApplyForm";
import { useAuth } from "@/components/auth/AuthProvider";
import type { NotionFormSchema, FormDatabaseType } from "@/lib/types/notion-form";

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
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [formSchema, setFormSchema] = useState<NotionFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로그인 여부 확인 및 비로그인 사용자 차단
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const currentPath = `/social/${socialingId}/apply`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [user, authLoading, router, socialingId]);

  useEffect(() => {
    // 로그인하지 않은 경우 스키마를 불러오지 않음
    if (!user || authLoading) return;
    let cancelled = false;

    async function fetchSchema() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/socialing/form-schema?type=${formDatabaseType}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "폼 스키마를 불러오는데 실패했습니다.");
        }

        if (!cancelled) {
          setFormSchema(data.schema as NotionFormSchema);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "폼 스키마를 불러오는데 실패했습니다.");
          setFormSchema(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSchema();
    return () => {
      cancelled = true;
    };
  }, [formDatabaseType, user, authLoading]);

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

  if (loading) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-text-secondary">폼을 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !formSchema) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error mb-4">{error || "폼을 불러올 수 없습니다."}</p>
          <p className="text-sm text-text-tertiary">잠시 후 다시 시도해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  // coverImage fallback 로직: formSchema.coverImage > socialingCoverImage > 없음
  const coverImage = formSchema.coverImage || socialingCoverImage;

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
        formSchema={formSchema}
        socialingId={socialingId}
        formDatabaseType={formDatabaseType}
      />
    </div>
  );
}
