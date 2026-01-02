"use client";

import { extractNotionPageId, formatNotionPageId } from "@/lib/utils/notion";

const NOTION_API_BASE = "https://api.notion.com/v1";

export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionPageContent {
  blocks: NotionBlock[];
  title?: string;
}

/**
 * Notion API 클라이언트 초기화
 */
function getNotionHeaders(): HeadersInit {
  const apiKey = process.env.NEXT_PUBLIC_NOTION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEY가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_NOTION_API_KEY를 추가해주세요."
    );
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

/**
 * Notion 페이지 내용 가져오기
 */
export async function getNotionPageContent(
  notionUrl: string
): Promise<NotionPageContent> {
  const pageId = extractNotionPageId(notionUrl);

  if (!pageId) {
    throw new Error("Notion URL에서 페이지 ID를 추출할 수 없습니다.");
  }

  const formattedPageId = formatNotionPageId(pageId);
  const headers = getNotionHeaders();

  try {
    // 1. 페이지 정보 가져오기
    const pageResponse = await fetch(
      `${NOTION_API_BASE}/pages/${formattedPageId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!pageResponse.ok) {
      const errorData = await pageResponse.json().catch(() => ({}));
      throw new Error(
        `Notion 페이지 조회 실패: ${errorData.message || pageResponse.statusText}`
      );
    }

    const pageData = await pageResponse.json();

    // 2. 페이지의 블록들 가져오기
    const blocksResponse = await fetch(
      `${NOTION_API_BASE}/blocks/${formattedPageId}/children`,
      {
        method: "GET",
        headers,
      }
    );

    if (!blocksResponse.ok) {
      const errorData = await blocksResponse.json().catch(() => ({}));
      throw new Error(
        `Notion 블록 조회 실패: ${errorData.message || blocksResponse.statusText}`
      );
    }

    const blocksData = await blocksResponse.json();

    // 3. 재귀적으로 모든 블록 가져오기 (has_more가 true인 경우)
    let allBlocks = blocksData.results || [];
    let nextCursor = blocksData.next_cursor;

    while (nextCursor) {
      const nextResponse = await fetch(
        `${NOTION_API_BASE}/blocks/${formattedPageId}/children?start_cursor=${nextCursor}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!nextResponse.ok) {
        break; // 다음 페이지 가져오기 실패 시 중단
      }

      const nextData = await nextResponse.json();
      allBlocks = [...allBlocks, ...(nextData.results || [])];
      nextCursor = nextData.next_cursor;
    }

    // 4. 페이지 제목 추출
    const title =
      pageData.properties?.title?.title?.[0]?.plain_text ||
      pageData.properties?.Name?.title?.[0]?.plain_text ||
      "Untitled";

    return {
      blocks: allBlocks,
      title,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Notion 페이지를 가져오는 중 오류가 발생했습니다.");
  }
}

/**
 * Notion 블록의 텍스트 내용 추출
 */
export function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) {
    return "";
  }

  return richText
    .map((item) => item.plain_text || "")
    .join("")
    .trim();
}

