"use client";

import { useEffect, useRef, useState } from "react";
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

// 이미지 파일인지 확인하는 헬퍼 함수 (JPG/JPEG/PNG만)
function isImageFile(urlOrName: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png"];
  const lower = urlOrName.toLowerCase();
  return imageExtensions.some((ext) => lower.endsWith(ext));
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
  const initialUrls = Array.isArray(value) ? value : [];
  const [files, setFiles] = useState<FileItem[]>(
    initialUrls.length > 0
      ? initialUrls.map((url) => ({ url, name: url.split("/").pop() || "파일" }))
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedUrlsRef = useRef<string[]>(initialUrls);

  const debugLog = (...args: any[]) => {
    // 파일 업로드 추적용 로그
    // eslint-disable-next-line no-console
    console.log("[FileUpload]", ...args);
  };

  const emitChangeAsync = (urls: string[]) => {
    debugLog("emitChangeAsync 호출", { urls, prev: lastEmittedUrlsRef.current });
    const prev = lastEmittedUrlsRef.current;
    const same = urls.length === prev.length && urls.every((u, i) => u === prev[i]);
    if (same) return;
    lastEmittedUrlsRef.current = urls;
    // state update 사이클 안에서 바로 부모 state를 건드리지 않도록 microtask로 분리
    queueMicrotask(() => onChange(urls));
  };

  // 외부 value 변경(예: 초기값/리셋)이 들어오면 로컬 상태도 동기화
  useEffect(() => {
    const nextUrls = Array.isArray(value) ? value : [];
    // 업로드 중에는 로컬 상태를 덮어쓰지 않음
    if (uploading) return;

    const currentUrls = files.filter((f) => !f.uploading).map((f) => f.url);
    const same =
      nextUrls.length === currentUrls.length &&
      nextUrls.every((u, i) => u === currentUrls[i]);
    if (same) return;

    debugLog("외부 value 변경 감지, 로컬 files 동기화", { nextUrls, currentUrls });
    setFiles(
      nextUrls.map((url) => ({ url, name: url.split("/").pop() || "파일" }))
    );
    // 외부에서 주어진 value에 맞춰 로컬만 맞추고, 여기서 onChange는 호출하지 않음
    lastEmittedUrlsRef.current = nextUrls;
  }, [value, uploading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    debugLog("파일 선택", {
      selectedCount: selectedFiles.length,
      names: selectedFiles.map((f) => f.name),
    });

    setUploadError(null);

    // 파일 개수 제한 체크
    if (files.length + selectedFiles.length > maxFiles) {
      debugLog("파일 개수 초과", {
        existingCount: files.length,
        selectedCount: selectedFiles.length,
        maxFiles,
      });
      const unit = maxFiles === 3 ? "장" : "개";
      setUploadError(`최대 ${maxFiles}${unit}까지 업로드 가능합니다.`);
      return;
    }

    const newFiles: FileItem[] = [];
    const uploadPromises: Promise<void>[] = [];

    for (const file of selectedFiles) {
      // 이미지 타입 검증 (jpg, jpeg, png만 허용)
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        debugLog("파일 타입 검증 실패", { name: file.name, type: file.type });
        setUploadError("JPG, JPEG, PNG 형식의 이미지 파일만 업로드 가능합니다.");
        continue;
      }

      // 파일 크기 검증
      const sizeValidation = validateFileSize(file, maxSizeMB);
      if (!sizeValidation.valid) {
        debugLog("파일 크기 검증 실패", {
          name: file.name,
          size: file.size,
          error: sizeValidation.error,
        });
        setUploadError(sizeValidation.error || "파일 크기가 너무 큽니다.");
        continue;
      }

      // 업로드 중 상태로 추가
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      debugLog("업로드 시작", { tempId, name: file.name, size: file.size, socialingId });
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
          debugLog("업로드 성공", { name: file.name, result });
          setFiles((prev) => {
            const next = prev.map((f) =>
              f.url === tempId ? { url: result.url, name: file.name, uploading: false } : f
            );
            const urls = next.filter((f) => !f.uploading).map((f) => f.url);
            emitChangeAsync(urls);
            return next;
          });
        })
        .catch((err) => {
          debugLog("업로드 오류", { name: file.name, error: err });
          setUploadError(
            err instanceof Error ? err.message : "파일 업로드에 실패했습니다."
          );
          setFiles((prev) => {
            const next = prev.filter((f) => f.url !== tempId);
            const urls = next.filter((f) => !f.uploading).map((f) => f.url);
            emitChangeAsync(urls);
            return next;
          });
        });

      uploadPromises.push(uploadPromise);
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);

    try {
      await Promise.all(uploadPromises);
      debugLog("모든 업로드 Promise 완료", { total: uploadPromises.length });
    } finally {
      setUploading(false);
      debugLog("업로드 상태 종료", { uploading: false });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (url: string) => {
    debugLog("파일 삭제 요청", { url, currentFiles: files.map(f => f.url) });
    
    // UI에서 먼저 제거 (즉시 반응)
    const updatedFiles = files.filter((f) => f.url !== url);
    debugLog("UI에서 파일 제거", { 
      beforeCount: files.length, 
      afterCount: updatedFiles.length,
      removedUrl: url 
    });
    
    // 이미지 로드 에러 상태에서도 제거
    setImageLoadErrors((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
    
    setFiles(updatedFiles);
    const newUrls = updatedFiles.filter((f) => !f.uploading).map((f) => f.url);
    emitChangeAsync(newUrls);
    debugLog("상태 업데이트 완료", { newUrls });

    // Supabase Storage에서 파일 삭제 (백그라운드)
    try {
      // URL에서 경로 추출
      // 예: https://...supabase.co/storage/v1/object/public/socialing-applications/{folder}/{filename}
      const parts = url.split("/socialing-applications/");
      debugLog("URL 파싱", { url, parts, partsLength: parts.length });
      
      if (parts.length > 1) {
        const storagePath = parts[1];
        debugLog("스토리지 삭제 시도", { bucket: "socialing-applications", path: storagePath });
        
        await deleteFile("socialing-applications", storagePath);
        debugLog("스토리지에서 파일 삭제 성공", { path: storagePath });
      } else {
        debugLog("URL 파싱 실패: socialing-applications 경로를 찾을 수 없음", { url });
      }
    } catch (err) {
      debugLog("파일 삭제 실패 (UI에서는 이미 제거됨)", { 
        error: err instanceof Error ? err.message : String(err),
        url 
      });
      // 삭제 실패해도 UI에서는 이미 제거했으므로 그대로 유지
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
          <span className="text-text-tertiary text-xs ml-2">
            {maxFiles === 3 ? `(최대 3장, 각 ${maxSizeMB}MB 이하)` : `(${maxSizeMB}MB 이하)`}
          </span>
        </label>
      )}

      <div className="space-y-3">
        {/* 파일 목록 */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => {
              const isImage = isImageFile(file.url) || isImageFile(file.name);
              const imageLoadFailed = imageLoadErrors.has(file.url);
              const showPreview = !file.uploading && isImage && file.url.startsWith('http') && !imageLoadFailed;

              return (
                <div
                  key={file.url}
                  className={cn(
                    "bg-surface-elevated rounded-lg border border-border overflow-hidden",
                    showPreview ? "p-0" : "p-3 flex items-center justify-between"
                  )}
                >
                  {file.uploading ? (
                    <div className="flex items-center gap-2 p-3 flex-1 min-w-0">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                      <span className="text-sm text-text-secondary truncate">
                        {file.name} 업로드 중...
                      </span>
                    </div>
                  ) : showPreview ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full aspect-square object-cover"
                        onError={() => {
                          debugLog("이미지 로드 실패", { url: file.url });
                          setImageLoadErrors((prev) => new Set(prev).add(file.url));
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-lg">
                          <span className="text-sm text-white truncate max-w-xs">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(file.url)}
                            className="text-white hover:bg-white/20 flex-shrink-0"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
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
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(file.url)}
                        className="ml-2 flex-shrink-0"
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 파일 선택 영역 */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            displayError
              ? "border-error bg-error-light/10"
              : files.length >= maxFiles
              ? "border-border bg-surface-disabled opacity-50 cursor-not-allowed"
              : "border-border hover:border-primary-300"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={maxFiles === 3 ? "image/jpeg,image/jpg,image/png" : undefined}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || files.length >= maxFiles}
          />
          <div className="space-y-2">
            <p className={cn(
              "text-sm",
              files.length >= maxFiles ? "text-text-tertiary" : "text-text-secondary"
            )}>
              {uploading ? (
                "업로드 중..."
              ) : files.length >= maxFiles ? (
                <>
                  최대 {maxFiles}장까지 업로드 가능합니다
                  {maxFiles === 3 && (
                    <>
                      <br />
                      <span className="text-xs text-text-tertiary">
                        각 {maxSizeMB}MB 이하
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  파일을 드래그하거나 클릭하여 업로드
                  <br />
                  <span className="text-xs text-text-tertiary">
                    {maxFiles === 3 ? `최대 ${maxFiles}장, 각 ` : ""}{maxSizeMB}MB 이하
                  </span>
                </>
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (files.length < maxFiles && !uploading) {
                  fileInputRef.current?.click();
                }
              }}
              disabled={uploading || files.length >= maxFiles}
            >
              파일 선택
            </Button>
          </div>
        </div>

        {displayError && (
          <p className="text-sm text-error">{displayError}</p>
        )}
      </div>
    </div>
  );
}
