"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { SocialingApplyForm } from "./SocialingApplyForm";
import type { NotionFormSchema, FormDatabaseType } from "@/lib/types/notion-form";

interface SocialingApplyPageClientProps {
  socialingId: string;
  formDatabaseType?: FormDatabaseType;
}

export function SocialingApplyPageClient({
  socialingId,
  formDatabaseType = "DORAN_BOOK",
}: SocialingApplyPageClientProps) {
  const [formSchema, setFormSchema] = useState<NotionFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [formDatabaseType]);

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

  return (
    <div className="space-y-6">
      {formSchema.coverImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={formSchema.coverImage}
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
