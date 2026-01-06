import { extractTextFromRichText } from "@/lib/services/notion-service";
import type { NotionBlock } from "@/lib/types/notion";

/**
 * 콜아웃 블록의 텍스트 추출
 */
export function extractCalloutText(block: NotionBlock): string {
  if (block.type !== "callout" || !block.callout?.rich_text) {
    return "";
  }
  return extractTextFromRichText(block.callout.rich_text);
}

/**
 * 콜아웃 블록이 "썸네일" 텍스트를 포함하는지 확인
 */
export function isThumbnailCallout(block: NotionBlock): boolean {
  const text = extractCalloutText(block);
  return text.toLowerCase().includes("썸네일");
}

/**
 * 콜아웃 블록이 "상세페이지" 텍스트를 포함하는지 확인
 */
export function isDetailCallout(block: NotionBlock): boolean {
  const text = extractCalloutText(block);
  return text.toLowerCase().includes("상세페이지");
}

/**
 * 콜아웃 블록이 "상세정보" 텍스트를 포함하는지 확인
 */
export function isInfoCallout(block: NotionBlock): boolean {
  const text = extractCalloutText(block);
  return text.toLowerCase().includes("상세정보");
}

/**
 * 콜아웃 블록이 "신청버튼" 텍스트를 포함하는지 확인
 */
export function isApplyButtonCallout(block: NotionBlock): boolean {
  const text = extractCalloutText(block);
  return text.toLowerCase().includes("신청버튼");
}

/**
 * 이미지 블록에서 URL 추출
 */
function extractImageUrl(block: NotionBlock): string | null {
  if (block.type !== "image" || !block.image) {
    return null;
  }

  if (block.image.type === "external" && block.image.external?.url) {
    return block.image.external.url;
  }

  if (block.image.type === "file" && block.image.file?.url) {
    return block.image.file.url;
  }

  return null;
}

/**
 * 콜아웃 블록 내부의 이미지 블록들 추출
 */
export function extractImagesFromCallout(block: NotionBlock): string[] {
  if (block.type !== "callout" || !block.children || !Array.isArray(block.children)) {
    return [];
  }

  const images: string[] = [];

  // children을 재귀적으로 순회하여 모든 이미지 찾기
  function collectImages(blocks: NotionBlock[]): void {
    for (const childBlock of blocks) {
      const imageUrl = extractImageUrl(childBlock);
      if (imageUrl) {
        images.push(imageUrl);
      }

      // 중첩된 children도 확인
      if (childBlock.children && Array.isArray(childBlock.children)) {
        collectImages(childBlock.children);
      }
    }
  }

  collectImages(block.children);
  return images;
}
