"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormFunnel } from "@/components/consumer/FormFunnel";
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
  const [currentStep, setCurrentStep] = useState(1);

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

  const validateAllFields = (): boolean => {
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

  const handleNext = () => {
    if (currentStep < formSchema.fields.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      openModal({
        type: "CUSTOM",
        title: "입력 오류",
        message: "필수 항목을 모두 입력해주세요.",
        primaryAction: {
          label: "확인",
          onClick: () => closeModal(),
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/socialing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialing_id: socialingId,
          form_database_type: formDatabaseType,
          form_database_id: formSchema.databaseId,
          form_data: formData,
          form_schema_snapshot: formSchema, // 신청 시점의 스키마 스냅샷 저장
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
      <CardContent className="pt-0">
        <FormFunnel
          fields={formSchema.fields}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          currentStep={currentStep}
          socialingId={socialingId}
        />
      </CardContent>
    </Card>
  );
}

