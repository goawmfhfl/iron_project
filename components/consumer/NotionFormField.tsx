"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FileUpload } from "@/components/consumer/FileUpload";
import { cn } from "@/lib/utils";
import type { NotionFormField } from "@/lib/types/notion-form";

interface NotionFormFieldProps {
  field: NotionFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  socialingId?: string;
}

export function NotionFormFieldRenderer({
  field,
  value,
  onChange,
  error,
  socialingId,
}: NotionFormFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (field.type === "checkbox") {
      onChange((e.target as HTMLInputElement).checked);
      return;
    }
    onChange(e.target.value);
  };

  switch (field.type) {
    case "title":
      return (
        <Input
          label={field.name}
          name={field.id}
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder={`${field.name}을(를) 입력하세요`}
        />
      );

    case "rich_text":
      return field.isLongText ? (
        <Textarea
          label={field.name}
          name={field.id}
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder={`${field.name}을(를) 입력하세요`}
        />
      ) : (
        <Input
          label={field.name}
          name={field.id}
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder={`${field.name}을(를) 입력하세요`}
        />
      );

    case "number":
      return (
        <Input
          label={field.name}
          name={field.id}
          type="number"
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder={`${field.name}을(를) 입력하세요`}
        />
      );

    case "email":
      return (
        <Input
          label={field.name}
          name={field.id}
          type="email"
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder="example@email.com"
        />
      );

    case "phone_number":
      return (
        <Input
          label={field.name}
          name={field.id}
          type="tel"
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder="010-1234-5678"
        />
      );

    case "url":
      return (
        <Input
          label={field.name}
          name={field.id}
          type="url"
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          placeholder="https://example.com"
        />
      );

    case "date":
      return (
        <Input
          label={field.name}
          name={field.id}
          type="date"
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
        />
      );

    case "select":
      return (
        <Select
          label={field.name}
          name={field.id}
          value={value || ""}
          onChange={handleChange}
          error={error}
          required={field.required}
          options={field.options?.map((opt) => ({ value: opt, label: opt })) || []}
        />
      );

    case "multi_select": {
      const currentValues = Array.isArray(value) ? value : [];
      const maxSelections = field.maxSelections;
      const canSelectMore = maxSelections
        ? currentValues.length < maxSelections
        : true;

      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {field.name}
            {field.required && <span className="text-error ml-1">*</span>}
            {maxSelections && (
              <span className="text-text-tertiary text-xs ml-2">
                (최대 {maxSelections}개)
              </span>
            )}
          </label>
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isChecked = currentValues.includes(option);
              const isDisabled = !isChecked && !canSelectMore;

              return (
                <label
                  key={option}
                  className={cn(
                    "flex items-center gap-2",
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        if (maxSelections && currentValues.length >= maxSelections) {
                          return;
                        }
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v) => v !== option));
                      }
                    }}
                    className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-primary">{option}</span>
                </label>
              );
            })}
          </div>
          {maxSelections && currentValues.length > 0 && (
            <p className="mt-2 text-xs text-text-secondary">
              {currentValues.length}/{maxSelections}개 선택됨
            </p>
          )}
          {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        </div>
      );
    }

    case "checkbox":
      return (
        <div className="w-full">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name={field.id}
              checked={value || false}
              onChange={handleChange}
              error={error}
            />
            <span className="text-sm font-medium text-text-primary">
              {field.name}
              {field.required && <span className="text-error ml-1">*</span>}
            </span>
          </label>
        </div>
      );

    case "files":
      return (
        <FileUpload
          label={field.name}
          value={Array.isArray(value) ? value : null}
          onChange={onChange}
          error={error}
          required={field.required}
          maxFiles={10}
          maxSizeMB={5}
          socialingId={socialingId}
        />
      );

    default:
      return null;
  }
}

