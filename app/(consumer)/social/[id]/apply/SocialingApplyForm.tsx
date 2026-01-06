"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NotionFormFieldRenderer } from "@/components/consumer/NotionFormField";
import { useModalStore } from "@/lib/stores/modal-store";
import type { NotionFormSchema, FormDatabaseType } from "@/lib/types/notion-form";

interface SocialingApplyFormProps {
  formSchema: NotionFormSchema;
  socialingId: string;
  formDatabaseType: FormDatabaseType;
}

export function SocialingApplyForm({
  formSchema,
  socialingId,
  formDatabaseType,
}: SocialingApplyFormProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    formSchema.fields.forEach((field) => {
      if (!field.required) return;
      const value = formData[field.id];
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        nextErrors[field.id] = `${field.name}을(를) 입력해주세요.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/socialing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialing_id: socialingId,
          form_database_type: formDatabaseType,
          form_database_id: formSchema.databaseId,
          applicant_data: formData,
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
        <h1 className="text-2xl font-bold text-text-primary">신청하기</h1>
        <p className="text-sm text-text-secondary mt-2">
          아래 정보를 입력해주세요.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formSchema.fields.map((field) => (
            <NotionFormFieldRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              error={errors[field.id]}
              socialingId={socialingId}
            />
          ))}

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "제출 중..." : "제출하기"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

