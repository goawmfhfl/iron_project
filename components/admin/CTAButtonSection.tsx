"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { CTAButton } from "@/lib/types/content";
import { cn } from "@/lib/utils";

interface CTAButtonSectionProps {
  buttons: CTAButton[];
  onChange: (buttons: CTAButton[]) => void;
  className?: string;
}

export function CTAButtonSection({
  buttons,
  onChange,
  className,
}: CTAButtonSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddButton = () => {
    const newButton: CTAButton = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      image_url: "",
      url: "",
    };
    onChange([...buttons, newButton]);
    setEditingIndex(buttons.length);
  };

  const handleUpdateButton = (index: number, updates: Partial<CTAButton>) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleDeleteButton = (index: number) => {
    const updated = buttons.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleEditButton = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          CTA 버튼
        </h3>
        <Button type="button" variant="primary" onClick={handleAddButton}>
          생성하기
        </Button>
      </div>

      {buttons.length === 0 ? (
        <Card elevation={1}>
          <CardContent className="py-8 text-center">
            <p className="text-text-secondary">
              CTA 버튼이 없습니다. &quot;생성하기&quot; 버튼을 클릭하여 추가하세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {buttons.map((button, index) => (
            <Card key={button.id} elevation={editingIndex === index ? 2 : 1}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary">
                    CTA 버튼 {index + 1}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditButton(index)}
                    >
                      {editingIndex === index ? "닫기" : "수정"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteButton(index)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {editingIndex === index ? (
                <CardContent className="space-y-4">
                  <Input
                    label="제목"
                    name={`cta-title-${index}`}
                    value={button.title}
                    onChange={(e) =>
                      handleUpdateButton(index, { title: e.target.value })
                    }
                    placeholder="CTA 버튼 제목"
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      설명
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border-2 bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-surface-elevated hover:border-primary-300 transition-colors min-h-[100px]"
                      value={button.description}
                      onChange={(e) =>
                        handleUpdateButton(index, {
                          description: e.target.value,
                        })
                      }
                      placeholder="CTA 버튼 설명"
                    />
                  </div>

                  <ImageUpload
                    label="이미지"
                    value={button.image_url}
                    onChange={(url) =>
                      handleUpdateButton(index, {
                        image_url: url || "",
                      })
                    }
                    bucket="cta-images"
                    expectedWidth={1280}
                    expectedHeight={720}
                  />

                  <Input
                    label="URL"
                    name={`cta-url-${index}`}
                    type="url"
                    value={button.url}
                    onChange={(e) =>
                      handleUpdateButton(index, { url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </CardContent>
              ) : (
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-text-secondary">
                        제목:
                      </span>{" "}
                      <span className="text-text-primary">{button.title || "미입력"}</span>
                    </div>
                    {button.description && (
                      <div>
                        <span className="text-sm font-medium text-text-secondary">
                          설명:
                        </span>{" "}
                        <span className="text-text-primary">{button.description}</span>
                      </div>
                    )}
                    {button.image_url && (
                      <div>
                        <img
                          src={button.image_url}
                          alt={button.title || "CTA 이미지"}
                          className="w-full max-w-md h-auto rounded-lg border border-surface-elevated"
                        />
                      </div>
                    )}
                    {button.url && (
                      <div>
                        <span className="text-sm font-medium text-text-secondary">
                          URL:
                        </span>{" "}
                        <a
                          href={button.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {button.url}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

