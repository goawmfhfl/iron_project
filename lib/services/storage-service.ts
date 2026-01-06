"use client";

import { supabase } from "@/lib/supabase/client";

function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx <= -1) return "";
  const ext = fileName.slice(idx).toLowerCase();
  // 확장자가 너무 길거나 이상하면 무시
  if (ext.length > 16) return "";
  // ".png" 같은 정상 형태만 허용
  if (!/^\.[a-z0-9]+$/.test(ext)) return "";
  return ext;
}

function safeFolder(folder: string): string {
  // 경로 구분자/공백/특수문자 최소화 (폴더는 보통 id라서 보수적으로 처리)
  const trimmed = folder.trim().replace(/^\/+|\/+$/g, "");
  const lowered = trimmed.toLowerCase();

  // UUID(하이픈 포함)로 들어오면 32자리 hex로 정규화
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      lowered
    )
  ) {
    return lowered.replace(/-/g, "");
  }

  // 이미 32자리 hex면 그대로 사용
  if (/^[0-9a-f]{32}$/.test(lowered)) {
    return lowered;
  }

  return lowered.replace(/[^a-z0-9/_-]/g, "_");
}

function makeSafeObjectName(originalName: string): string {
  const timestamp = Date.now();
  const ext = getFileExtension(originalName);
  const rand =
    (globalThis.crypto as Crypto | undefined)?.randomUUID?.() ??
    `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  // Supabase Storage key에 안전한 문자만 사용
  return `${timestamp}-${rand}${ext}`;
}

export interface UploadImageOptions {
  file: File;
  bucket: "thumbnails" | "profile-images";
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

  // 파일명 생성: 원본 파일명을 그대로 쓰면 InvalidKey가 날 수 있어 안전한 이름으로 재생성
  const fileName = makeSafeObjectName(file.name);
  const cleanFolder = folder ? safeFolder(folder) : "";
  const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

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
  bucket: "thumbnails" | "profile-images",
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

export type StorageBucket =
  | "thumbnails"
  | "files"
  | "socialing-applications"
  | "profile-images";

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

  const fileName = makeSafeObjectName(file.name);
  const cleanFolder = folder ? safeFolder(folder) : "";
  const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

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
