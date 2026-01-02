"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ContentForm } from "@/components/admin/ContentForm";
import {
  getContentById,
  updateContent,
} from "@/lib/services/content-service";
import type { ReadMargnet, UpdateReadMargnetInput } from "@/lib/types/content";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [content, setContent] = useState<ReadMargnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getContentById(id);
        if (!data) {
          alert("컨텐츠를 찾을 수 없습니다.");
          router.push("/admin/posts");
          return;
        }
        setContent(data);
      } catch (error) {
        console.error("컨텐츠 조회 실패:", error);
        alert("컨텐츠를 불러오는데 실패했습니다.");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id, router]);

  const handleSubmit = async (data: UpdateReadMargnetInput) => {
    try {
      setIsSubmitting(true);
      await updateContent(id, data);
      router.push("/admin/posts");
    } catch (error) {
      console.error("컨텐츠 수정 실패:", error);
      alert(
        error instanceof Error ? error.message : "컨텐츠 수정에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/posts");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card elevation={2}>
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">
            컨텐츠 수정
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            컨텐츠 정보를 수정합니다.
          </p>
        </CardHeader>
        <CardContent>
          <ContentForm
            initialData={content}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

