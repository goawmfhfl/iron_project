"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ContentForm } from "@/components/admin/ContentForm";
import { createContent } from "@/lib/services/content-service";
import type {
  CreateReadMargnetInput,
  UpdateReadMargnetInput,
} from "@/lib/types/content";

export default function NewPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    data: CreateReadMargnetInput | UpdateReadMargnetInput
  ) => {
    try {
      setIsLoading(true);
      // new 페이지에서는 모든 필드가 필수이므로 CreateReadMargnetInput으로 타입 단언
      await createContent(data as CreateReadMargnetInput);
      router.push("/admin/posts");
    } catch (error) {
      console.error("컨텐츠 생성 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "컨텐츠 생성에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/posts");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card elevation={2}>
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">
            컨텐츠 생성
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            새로운 컨텐츠를 생성합니다.
          </p>
        </CardHeader>
        <CardContent>
          <ContentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

