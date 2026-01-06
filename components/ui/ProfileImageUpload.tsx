"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "./Button";
import {
  uploadImage,
  deleteImage,
  validateImageType,
} from "@/lib/services/storage-service";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  className?: string;
}

export function ProfileImageUpload({
  value,
  onChange,
  error,
  className,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 파일 타입 검증
    if (!validateImageType(file)) {
      setUploadError("JPEG, PNG, WebP 형식만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    try {
      setUploading(true);
      const previousPath = uploadedPath;
      const result = await uploadImage({
        file,
        bucket: "profile-images",
        folder: "profiles",
      });

      // 이전에 업로드된 이미지가 있다면 정리
      if (previousPath) {
        try {
          await deleteImage("profile-images", previousPath);
        } catch (cleanupError) {
          console.warn(
            "이전 프로필 이미지 삭제 중 오류가 발생했습니다:",
            cleanupError
          );
        }
      }

      onChange(result.url);
      setUploadedPath(result.path);
      setUploadError(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다."
      );
      setPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (uploadedPath) {
      // 현재 업로드된 이미지가 있다면 스토리지에서도 삭제
      deleteImage("profile-images", uploadedPath).catch((err) => {
        console.warn("프로필 이미지 삭제 중 오류가 발생했습니다:", err);
      });
    }

    setPreview(null);
    setUploadedPath(null);
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        프로필 이미지
        <span className="text-text-tertiary text-xs ml-2">(선택사항)</span>
      </label>

      <div className="space-y-3">
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border">
              <Image
                src={preview}
                alt="프로필 미리보기"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "업로드 중..." : "변경"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              displayError
                ? "border-error bg-error-light/10"
                : "border-border hover:border-primary-300"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-surface-elevated border-2 border-border flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-text-tertiary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">
                {uploading ? (
                  "업로드 중..."
                ) : (
                  <>
                    프로필 이미지를 업로드하세요
                    <br />
                    <span className="text-xs text-text-tertiary">
                      (5MB 이하, 정사각형 권장)
                    </span>
                  </>
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                이미지 선택
              </Button>
            </div>
          </div>
        )}

        {displayError && (
          <p className="text-sm text-error">{displayError}</p>
        )}
      </div>
    </div>
  );
}
