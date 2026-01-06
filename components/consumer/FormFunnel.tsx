"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NotionFormFieldRenderer } from "./NotionFormField";
import type { NotionFormField } from "@/lib/types/notion-form";
import { cn } from "@/lib/utils";

interface FormFunnelProps {
  fields: NotionFormField[];
  formData: Record<string, any>;
  errors: Record<string, string>;
  onFieldChange: (fieldId: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  currentStep: number;
  socialingId: string;
  className?: string;
}

export function FormFunnel({
  fields,
  formData,
  errors,
  onFieldChange,
  onNext,
  onPrevious,
  onSubmit,
  currentStep,
  socialingId,
  className,
}: FormFunnelProps) {
  const totalSteps = fields.length;
  const currentField = fields[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const validateCurrentStep = (): boolean => {
    if (!currentField) return false;
    
    // 필수 필드 검증
    if (currentField.required) {
      const value = formData[currentField.id];
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      return;
    }
    onSubmit();
  };

  if (!currentField) {
    return null;
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* 진행률 및 단계 정보 통합 */}

      <div className="pt-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        
      </div>


      {/* 현재 필드 표시 */}
      <div className="flex flex-col justify-center">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              {currentField.name}
              {currentField.required && (
                <span className="text-error ml-1.5">*</span>
              )}
            </h2>
            {currentField.description && (
              <p className="text-sm text-text-secondary mt-3">
                {currentField.description}
              </p>
            )}
          </div>

          <div>
            <NotionFormFieldRenderer
              field={currentField}
              value={formData[currentField.id]}
              onChange={(value) => onFieldChange(currentField.id, value)}
              error={errors[currentField.id]}
              socialingId={socialingId}
            />
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex gap-4 pt-6 border-t border-border">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="flex-1 h-11 text-base font-semibold"
          >
            이전
          </Button>
        )}
        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            className={cn("flex-1 h-11 text-base font-semibold", isFirstStep && "w-full")}
          >
            제출하기
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className={cn("flex-1 h-11 text-base font-semibold", isFirstStep && "w-full")}
            disabled={!validateCurrentStep()}
          >
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
