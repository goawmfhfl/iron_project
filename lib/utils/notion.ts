/**
 * Notion URL에서 페이지 ID 추출
 * 
 * 지원 형식:
 * - https://notion.so/page-name-{pageId}
 * - https://www.notion.so/page-name-{pageId}
 * - https://notion.so/{pageId}
 * - {pageId} (이미 ID만 있는 경우)
 */
export function extractNotionPageId(url: string): string | null {
  if (!url) return null;

  // 이미 UUID 형식인 경우 (32자 하이픈 포함)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(url.trim())) {
    return url.trim();
  }

  try {
    // URL 파싱
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Notion URL 형식: /page-name-{pageId} 또는 /{pageId}
    // 페이지 ID는 마지막 하이픈 뒤의 32자 UUID
    const parts = pathname.split("-");
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      // UUID 형식 확인
      if (uuidRegex.test(lastPart)) {
        return lastPart;
      }
    }

    // 직접 UUID가 pathname인 경우
    if (uuidRegex.test(pathname.replace(/^\//, ""))) {
      return pathname.replace(/^\//, "");
    }
  } catch {
    // URL 파싱 실패 시 문자열에서 직접 추출 시도
    const uuidMatch = url.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    if (uuidMatch) {
      return uuidMatch[0];
    }
  }

  return null;
}

/**
 * Notion 페이지 ID를 표준 형식으로 변환 (하이픈 제거)
 */
export function formatNotionPageId(pageId: string): string {
  return pageId.replace(/-/g, "");
}

