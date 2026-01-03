"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { StatusSelect } from "./StatusSelect";
import type {
  ReadMargnet,
  CreateReadMargnetInput,
  UpdateReadMargnetInput,
  ContentStatus,
} from "@/lib/types/content";

interface ContentFormProps {
  initialData?: ReadMargnet;
  onSubmit: (
    data: CreateReadMargnetInput | UpdateReadMargnetInput
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ContentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    thumbnail_url: initialData?.thumbnail_url || null,
    notion_url: initialData?.notion_url || "",
    status: (initialData?.status || "대기") as ContentStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        thumbnail_url: initialData.thumbnail_url,
        notion_url: initialData.notion_url,
        status: initialData.status || "대기",
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "설명을 입력해주세요.";
    }

    if (!formData.notion_url.trim()) {
      newErrors.notion_url = "Notion URL을 입력해주세요.";
    } else {
      try {
        new URL(formData.notion_url);
      } catch {
        newErrors.notion_url = "올바른 URL 형식을 입력해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 수정 화면에서는 상태 변경이 별도(즉시 반영)로 처리되므로,
    // 폼 저장 시 status를 함께 보내서 의도치 않게 덮어쓰지 않도록 제외합니다.
    if (initialData) {
      const { title, description, thumbnail_url, notion_url } = formData;
      await onSubmit({ title, description, thumbnail_url, notion_url });
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="제목"
        name="title"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
        error={errors.title}
        required
        placeholder="컨텐츠 제목을 입력하세요"
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          설명
          <span className="text-error ml-1">*</span>
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-lg border-2 bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-surface-elevated hover:border-primary-300 transition-colors min-h-[150px]"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="컨텐츠 설명을 입력하세요"
          required
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-error">{errors.description}</p>
        )}
      </div>

      <ImageUpload
        label="썸네일 이미지"
        value={formData.thumbnail_url}
        onChange={(url) =>
          setFormData((prev) => ({ ...prev, thumbnail_url: url }))
        }
        bucket="thumbnails"
        expectedWidth={1280}
        expectedHeight={720}
        error={errors.thumbnail_url}
      />

      <Input
        label="Notion URL"
        name="notion_url"
        type="url"
        value={formData.notion_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, notion_url: e.target.value }))
        }
        error={errors.notion_url}
        required
        placeholder="https://notion.so/..."
      />

      {initialData && (
        <StatusSelect
          contentId={initialData.id}
          currentStatus={formData.status}
          variant="form"
          label="상태"
        />
      )}

      <div className="flex gap-4 justify-end pt-4 border-t border-surface-elevated">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "저장 중..." : initialData ? "수정" : "생성"}
        </Button>
      </div>
    </form>
  );
}

