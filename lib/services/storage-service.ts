"use client";

import { supabase } from "@/lib/supabase/client";

export interface UploadImageOptions {
  file: File;
  bucket: "thumbnails";
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImage(
  options: UploadImageOptions
): Promise<UploadImageResult> {
  const { file, bucket, folder = "", onProgress } = options;

  // 파일명 생성 (타임스탬프 + 원본 파일명)
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // 파일 업로드
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  // 공개 URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * 이미지 삭제
 */
export async function deleteImage(
  bucket: "thumbnails",
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}

/**
 * 이미지 크기 검증 (유튜브 썸네일 크기: 1280x720px)
 */
export function validateImageSize(
  file: File,
  expectedWidth: number = 1280,
  expectedHeight: number = 720
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width !== expectedWidth || img.height !== expectedHeight) {
        resolve({
          valid: false,
          error: `이미지 크기는 ${expectedWidth}x${expectedHeight}px여야 합니다. (현재: ${img.width}x${img.height}px)`,
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: "이미지를 읽을 수 없습니다.",
      });
    };

    img.src = url;
  });
}

/**
 * 이미지 파일 타입 검증
 */
export function validateImageType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
}

export type StorageBucket = "thumbnails" | "files" | "socialing-applications";

export interface UploadFileOptions {
  file: File;
  bucket: StorageBucket;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadFileResult {
  url: string;
  path: string;
}

/**
 * 파일을 Supabase Storage에 업로드
 */
export async function uploadFile(
  options: UploadFileOptions
): Promise<UploadFileResult> {
  const { file, bucket, folder = "" } = options;

  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * 파일 삭제
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

/**
 * 파일 크기 검증 (기본 5MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): {
  valid: boolean;
  error?: string;
} {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }
  return { valid: true };
}
