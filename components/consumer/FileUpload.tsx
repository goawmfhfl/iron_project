"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { uploadFile, validateFileSize, deleteFile } from "@/lib/services/storage-service";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string[] | null;
  onChange: (urls: string[]) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  socialingId?: string; // 소셜링 신청 ID (폴더명으로 사용)
}

interface FileItem {
  url: string;
  name: string;
  uploading?: boolean;
}

export function FileUpload({
  value,
  onChange,
  label,
  error,
  required,
  className,
  maxFiles = 10,
  maxSizeMB = 5,
  socialingId,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>(
    value && value.length > 0
      ? value.map((url) => ({ url, name: url.split("/").pop() || "파일" }))
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadError(null);

    // 파일 개수 제한 체크
    if (files.length + selectedFiles.length > maxFiles) {
      setUploadError(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
      return;
    }

    const newFiles: FileItem[] = [];
    const uploadPromises: Promise<void>[] = [];

    for (const file of selectedFiles) {
      // 파일 크기 검증
      const sizeValidation = validateFileSize(file, maxSizeMB);
      if (!sizeValidation.valid) {
        setUploadError(sizeValidation.error || "파일 크기가 너무 큽니다.");
        continue;
      }

      // 업로드 중 상태로 추가
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      newFiles.push({
        url: tempId,
        name: file.name,
        uploading: true,
      });

      // 업로드 실행
      const uploadPromise = uploadFile({
        file,
        bucket: "socialing-applications",
        folder: socialingId,
      })
        .then((result) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.url === tempId
                ? { url: result.url, name: file.name, uploading: false }
                : f
            )
          );
        })
        .catch((err) => {
          setUploadError(
            err instanceof Error ? err.message : "파일 업로드에 실패했습니다."
          );
          setFiles((prev) => prev.filter((f) => f.url !== tempId));
        });

      uploadPromises.push(uploadPromise);
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);

    try {
      await Promise.all(uploadPromises);
      // 업로드 완료된 파일 URL 배열 업데이트
      setFiles((prev) => {
        const completedFiles = prev.filter((f) => !f.uploading);
        const urls = completedFiles.map((f) => f.url);
        onChange(urls);
        return prev;
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (url: string) => {
    try {
      // Supabase Storage에서 파일 삭제
      // .../storage/v1/object/public/socialing-applications/{path}
      const parts = url.split("/socialing-applications/");
      if (parts.length > 1) {
        await deleteFile("socialing-applications", parts[1]);
      }
    } catch (err) {
      console.error("파일 삭제 실패:", err);
      // 삭제 실패해도 UI에서는 제거
    }

    const updatedFiles = files.filter((f) => f.url !== url);
    setFiles(updatedFiles);
    onChange(updatedFiles.map((f) => f.url));
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
          <span className="text-text-tertiary text-xs ml-2">
            (최대 {maxFiles}개, {maxSizeMB}MB 이하)
          </span>
        </label>
      )}

      <div className="space-y-3">
        {/* 파일 목록 */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.url}
                className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {file.uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                      <span className="text-sm text-text-secondary truncate">
                        {file.name} 업로드 중...
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 text-text-secondary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm text-text-primary truncate">
                        {file.name}
                      </span>
                    </>
                  )}
                </div>
                {!file.uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file.url)}
                    className="ml-2 flex-shrink-0"
                  >
                    삭제
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 파일 선택 영역 */}
        {files.length < maxFiles && (
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
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">
                {uploading ? (
                  "업로드 중..."
                ) : (
                  <>
                    파일을 드래그하거나 클릭하여 업로드
                    <br />
                    <span className="text-xs text-text-tertiary">
                      최대 {maxFiles}개, 각 {maxSizeMB}MB 이하
                    </span>
                  </>
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || files.length >= maxFiles}
              >
                파일 선택
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
