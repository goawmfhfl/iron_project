import { Client } from "@notionhq/client";
import { extractNotionPageId, formatNotionPageId } from "@/lib/utils/notion";
import type { NotionBlock, NotionPageContent } from "@/lib/types/notion";
import type {
  NotionContent,
  NotionContentsQueryParams,
  NotionContentsQueryResult,
} from "@/lib/types/notion-content";
import { parseNotionPageToContent, extractCoverImage, extractTextFromProperty } from "@/lib/types/notion-content";
import type {
  SocialingThumbnail,
  Socialing,
  SocialingStatus,
  SocialingType,
  EventDate,
} from "@/lib/types/socialing";
import type {
  NotionFormSchema,
  NotionFormField,
  NotionFormFieldType,
  FormDatabaseType,
} from "@/lib/types/notion-form";

const NOTION_API_BASE = "https://api.notion.com/v1";

/**
 * Notion API 헤더 생성
 */
function getNotionHeaders(): HeadersInit {
  const apiKey = process.env.NOTION_TOKEN;

  if (!apiKey) {
    throw new Error("NOTION_TOKEN이 설정되지 않았습니다.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

/**
 * 중첩된 블록들을 재귀적으로 가져오기
 */
async function fetchNestedBlocks(
  blockId: string,
  headers: HeadersInit
): Promise<NotionBlock[]> {
  const nestedBlocks: NotionBlock[] = [];
  let nextCursor: string | null = null;

  do {
    const url: string = `${NOTION_API_BASE}/blocks/${blockId}/children${
      nextCursor ? `?start_cursor=${nextCursor}` : ""
    }`;

    const response: Response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(
        `중첩 블록 가져오기 실패: ${errorData.message || response.statusText}`
      );
    }

    const data: any = await response.json();
    nestedBlocks.push(...(data.results || []));

    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  // 각 블록의 중첩 블록도 재귀적으로 가져오기
  const blocksWithNested: NotionBlock[] = [];
  for (const block of nestedBlocks) {
    const blockWithNested = { ...block } as NotionBlock;
    if (block.has_children) {
      blockWithNested.children = await fetchNestedBlocks(block.id, headers);
    }
    blocksWithNested.push(blockWithNested);
  }

  return blocksWithNested;
}

/**
 * Notion 페이지의 블록들을 가져오기
 */
async function fetchPageBlocks(
  pageId: string,
  headers: HeadersInit
): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let nextCursor: string | null = null;

  do {
    const url: string = `${NOTION_API_BASE}/blocks/${pageId}/children${
      nextCursor ? `?start_cursor=${nextCursor}` : ""
    }`;

    const response: Response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(
        `블록 가져오기 실패: ${errorData.message || response.statusText}`
      );
    }

    const data: any = await response.json();
    const fetchedBlocks = data.results || [];

    // 각 블록의 중첩 블록도 가져오기
    for (const block of fetchedBlocks) {
      const blockWithNested = { ...block } as NotionBlock;
      if (block.has_children) {
        blockWithNested.children = await fetchNestedBlocks(block.id, headers);
      }
      blocks.push(blockWithNested);
    }

    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  return blocks;
}

/**
 * Notion 페이지의 제목 추출
 */
function extractPageTitle(page: any): string | undefined {
  if (!page.properties) return undefined;

  // properties에서 title 속성 찾기
  for (const [key, value] of Object.entries(page.properties)) {
    if ((value as any).type === "title" && (value as any).title) {
      const titleArray = (value as any).title;
      if (Array.isArray(titleArray) && titleArray.length > 0) {
        return titleArray
          .map((item: any) => item.plain_text || "")
          .join("")
          .trim();
      }
    }
  }

  return undefined;
}

/**
 * 중첩된 블록들을 평탄화하여 순서대로 배열로 변환
 * callout, toggle 같은 컨테이너 블록은 그대로 유지하고 내부 children은 유지
 * 다른 블록들의 children은 평탄화하여 순서대로 배치
 */
function flattenBlocks(blocks: NotionBlock[]): NotionBlock[] {
  const flattened: NotionBlock[] = [];

  for (const block of blocks) {
    // 컨테이너 블록 타입들 (children을 내부에 유지해야 하는 블록)
    const containerTypes = [
      "callout",
      "toggle",
      "quote",
      "column_list",
      "column",
      "synced_block",
      "child_page",
      "child_database",
      "link_to_page",
    ];

    if (containerTypes.includes(block.type)) {
      // 컨테이너 블록은 그대로 추가 (children은 유지됨)
      flattened.push(block);
    } else {
      // 일반 블록은 평탄화
      const { children, ...blockWithoutChildren } = block;
      flattened.push(blockWithoutChildren as NotionBlock);

      // children이 있으면 재귀적으로 평탄화하여 순서대로 추가
      if (children && Array.isArray(children) && children.length > 0) {
        const childBlocks = flattenBlocks(children);
        flattened.push(...childBlocks);
      }
    }
  }

  return flattened;
}

type NotionPropertyInfo = { name: string; type: string };

// DB 스키마 캐시 (메모리 기반, 서버 재시작 시 초기화)
// key: databaseId
// value: Map<lowerPropertyName, { name, type }>
const propertyInfoCache = new Map<string, Map<string, NotionPropertyInfo>>();

/**
 * Notion 데이터베이스 스키마를 가져와 캐시에 적재
 */
async function ensureDatabaseSchemaCached(
  databaseId: string,
  headers: HeadersInit
): Promise<Map<string, NotionPropertyInfo> | null> {
  try {
    const existing = propertyInfoCache.get(databaseId);
    if (existing && existing.size > 0) return existing;

    // 데이터베이스 스키마 가져오기
    const dbResponse = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
      method: "GET",
      headers,
      next: { revalidate: 3600 },
    });

    if (!dbResponse.ok) {
      return null;
    }

    const dbData = await dbResponse.json();
    const properties = dbData.properties || {};

    const map = new Map<string, NotionPropertyInfo>();
    for (const [key, value] of Object.entries(properties)) {
      const v = value as any;
      const type = typeof v?.type === "string" ? v.type : "unknown";
      map.set(key.toLowerCase(), { name: key, type });
    }

    propertyInfoCache.set(databaseId, map);
    return map;
  } catch (error) {
    console.error("ensureDatabaseSchemaCached error:", error);
    return null;
  }
}

/**
 * Notion 데이터베이스에서 속성 정보 찾기 (대소문자 무시, 캐시 사용)
 */
async function findPropertyInfo(
  databaseId: string,
  headers: HeadersInit,
  targetName: string
): Promise<NotionPropertyInfo | null> {
  const schema = await ensureDatabaseSchemaCached(databaseId, headers);
  if (!schema) return null;
  return schema.get(targetName.toLowerCase()) ?? null;
}

function buildEqualsFilter(info: NotionPropertyInfo, value: string): any | null {
  const v = value?.trim?.() ?? "";
  if (!v) return null;

  // Notion 속성 타입에 따라 필터 키가 다름
  if (info.type === "status") {
    return { property: info.name, status: { equals: v } };
  }
  if (info.type === "select") {
    return { property: info.name, select: { equals: v } };
  }
  if (info.type === "multi_select") {
    return { property: info.name, multi_select: { contains: v } };
  }

  // fallback: select로 시도 (스키마가 unknown인 경우)
  return { property: info.name, select: { equals: v } };
}

/**
 * Notion 데이터베이스에서 컨텐츠 목록 조회 (서버 사이드)
 */
export async function getNotionContentsDatabase(
  params: NotionContentsQueryParams = {}
): Promise<NotionContentsQueryResult> {
  try {
    const databaseId = process.env.NOTION_CONTENTS_DATABASE_ID;
    if (!databaseId) {
      throw new Error("NOTION_CONTENTS_DATABASE_ID가 설정되지 않았습니다.");
    }

    const headers = getNotionHeaders();
    const pageSize = params.pageSize || 10;

    // 필터 조건 구성
    const filters: any[] = [];

    // Status 필터
    if (params.status && params.status.length > 0) {
      const statusInfo = await findPropertyInfo(databaseId, headers, "status");
      if (statusInfo) {
        const values = params.status.filter(Boolean);
        if (values.length === 1) {
          const f = buildEqualsFilter(statusInfo, values[0]);
          if (f) filters.push(f);
        } else if (values.length > 1) {
          const ors = values
            .map((s) => buildEqualsFilter(statusInfo, s))
            .filter(Boolean);
          if (ors.length > 0) {
            filters.push({ or: ors });
          }
        }
      }
    }

    // firstCategory 필터 (빈 문자열 체크 추가)
    if (params.firstCategory && params.firstCategory.trim() !== "") {
      const firstInfo = await findPropertyInfo(databaseId, headers, "firstCategory");
      if (firstInfo) {
        const f = buildEqualsFilter(firstInfo, params.firstCategory);
        if (f) filters.push(f);
      }
    }

    // secondCategory 필터 (빈 문자열 체크 추가)
    if (params.secondCategory && params.secondCategory.trim() !== "") {
      const secondInfo = await findPropertyInfo(databaseId, headers, "secondCategory");
      if (secondInfo) {
        const f = buildEqualsFilter(secondInfo, params.secondCategory);
        if (f) filters.push(f);
      }
    }

    const queryBody: any = {
      page_size: pageSize,
    };

    if (filters.length > 0) {
      queryBody.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    if (params.startCursor) {
      queryBody.start_cursor = params.startCursor;
    }

    const queryResponse = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(queryBody),
        next: { revalidate: 3600 }, // 1시간 캐시
      }
    );

    if (!queryResponse.ok) {
      const errorData = await queryResponse.json().catch(() => ({}));
      console.error("Notion database query error:", errorData);
      throw new Error(
        `Notion 데이터베이스 쿼리 실패: ${errorData.message || queryResponse.statusText}`
      );
    }

    const data = await queryResponse.json();
    const pages = data.results || [];

    // Notion 페이지를 NotionContent로 변환
    const contents: NotionContent[] = [];
    for (const page of pages) {
      const content = parseNotionPageToContent(page);
      if (content) {
        contents.push(content);
      }
    }

    return {
      contents,
      hasMore: data.has_more || false,
      nextCursor: data.next_cursor || null,
    };
  } catch (error) {
    console.error("getNotionContentsDatabase error:", error);
    throw error;
  }
}

/**
 * Notion 데이터베이스에서 카테고리 목록 조회 (서버 사이드)
 */
export async function getNotionCategories(): Promise<{
  firstCategories: string[];
  secondCategories: Record<string, string[]>;
}> {
  try {
    const databaseId = process.env.NOTION_CONTENTS_DATABASE_ID;
    if (!databaseId) {
      throw new Error("NOTION_CONTENTS_DATABASE_ID가 설정되지 않았습니다.");
    }

    const headers = getNotionHeaders();

    // 모든 컨텐츠 조회 (카테고리 추출용)
    const queryResponse = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_size: 100,
        }),
        next: { revalidate: 3600 }, // 1시간 캐시
      }
    );

    if (!queryResponse.ok) {
      const errorData = await queryResponse.json().catch(() => ({}));
      throw new Error(
        `Notion 데이터베이스 쿼리 실패: ${errorData.message || queryResponse.statusText}`
      );
    }

    const data = await queryResponse.json();
    const pages = data.results || [];

    const firstCategoriesSet = new Set<string>();
    const secondCategoriesMap = new Map<string, Set<string>>();

    for (const page of pages) {
      const content = parseNotionPageToContent(page);
      if (!content) continue;

      if (content.firstCategory) {
        firstCategoriesSet.add(content.firstCategory);

        if (content.secondCategory) {
          if (!secondCategoriesMap.has(content.firstCategory)) {
            secondCategoriesMap.set(content.firstCategory, new Set());
          }
          secondCategoriesMap.get(content.firstCategory)!.add(content.secondCategory);
        }
      }
    }

    const secondCategories: Record<string, string[]> = {};
    for (const [firstCategory, secondSet] of secondCategoriesMap.entries()) {
      secondCategories[firstCategory] = Array.from(secondSet).sort();
    }

    return {
      firstCategories: Array.from(firstCategoriesSet).sort(),
      secondCategories,
    };
  } catch (error) {
    console.error("getNotionCategories error:", error);
    throw error;
  }
}

/**
 * Notion 페이지 ID로 컨텐츠 조회 (서버 사이드)
 */
export async function getNotionContentByPageId(
  pageId: string
): Promise<NotionContent | null> {
  try {
    const headers = getNotionHeaders();
    const formattedPageId = formatNotionPageId(pageId);

    const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${formattedPageId}`, {
      method: "GET",
      headers,
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!pageResponse.ok) {
      if (pageResponse.status === 404) {
        return null;
      }
      const errorData = await pageResponse.json().catch(() => ({}));
      throw new Error(
        `Notion 페이지 조회 실패: ${errorData.message || pageResponse.statusText}`
      );
    }

    const page = await pageResponse.json();
    return parseNotionPageToContent(page);
  } catch (error) {
    console.error("getNotionContentByPageId error:", error);
    throw error;
  }
}

/**
 * Notion 페이지 내용 가져오기 (서버 사이드)
 */
export async function getNotionPageContent(
  notionUrl: string
): Promise<NotionPageContent> {
  try {
    if (!notionUrl || typeof notionUrl !== "string") {
      throw new Error("유효하지 않은 Notion URL입니다.");
    }

    const headers = getNotionHeaders();

    // 페이지 ID 추출 및 변환
    const pageIdRaw = extractNotionPageId(notionUrl);
    if (!pageIdRaw) {
      throw new Error("유효하지 않은 Notion URL입니다.");
    }

    const pageId = formatNotionPageId(pageIdRaw);

    // 페이지 정보 가져오기
    const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
      method: "GET",
      headers,
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!pageResponse.ok) {
      const errorData = await pageResponse.json().catch(() => ({}));
      console.error("Notion API error:", errorData);
      throw new Error(
        `Notion 페이지 조회 실패: ${errorData.message || pageResponse.statusText}`
      );
    }

    const page = await pageResponse.json();
    const title = extractPageTitle(page);

    // 블록들 가져오기
    const rawBlocks = await fetchPageBlocks(pageId, headers);

    // 블록들을 평탄화하여 순서대로 렌더링 가능하도록 변환
    const flattenedBlocks = flattenBlocks(rawBlocks);

    return {
      title,
      blocks: flattenedBlocks,
    };
  } catch (error) {
    console.error("getNotionPageContent error:", error);
    throw error;
  }
}

/**
 * Notion 페이지 속성에서 숫자 추출
 */
function extractNumberFromProperty(property: any): number | null {
  if (!property) return null;

  if (property.type === "number") {
    return property.number ?? null;
  }

  return null;
}

/**
 * Notion 페이지 속성에서 URL 추출
 */
function extractUrlFromProperty(property: any): string | null {
  if (!property) return null;

  if (property.type === "url") {
    return property.url || null;
  }

  return null;
}

/**
 * 날짜 문자열에 시간이 포함되어 있는지 확인
 */
function hasTime(dateString: string): boolean {
  return dateString.includes("T") && dateString.split("T")[1]?.length > 0;
}

/**
 * Notion 페이지 속성에서 날짜 범위 추출
 */
function extractDateRangeFromProperty(property: any): EventDate | null {
  if (!property || property.type !== "date" || !property.date) {
    return null;
  }

  const date = property.date;
  const start = date.start || null;
  const end = date.end || null;

  if (!start) return null;

  return {
    start,
    end,
    hasStartTime: start ? hasTime(start) : false,
    hasEndTime: end ? hasTime(end) : false,
  };
}

/**
 * Notion 페이지를 SocialingThumbnail로 변환
 */
function parseNotionPageToThumbnail(page: any): SocialingThumbnail | null {
  if (!page || !page.id) return null;

  const pageId = page.id;
  let order = 0;
  let status: SocialingStatus | null = null;
  let url: string | null = null;

  for (const [key, value] of Object.entries(page.properties || {})) {
    const prop = value as any;

    // order 찾기 (number 타입)
    if (key.toLowerCase() === "order" && prop.type === "number") {
      order = prop.number ?? 0;
    }

    // status 찾기
    if (key.toLowerCase() === "status" && prop.type === "select") {
      status = (extractTextFromProperty(prop) as SocialingStatus) || null;
    }

    // url 찾기
    if (key.toLowerCase() === "url" && prop.type === "url") {
      url = extractUrlFromProperty(prop);
    }
  }

  if (status === null) return null;

  const coverImage = extractCoverImage(page);

  return {
    pageId,
    order,
    status,
    url,
    coverImage,
  };
}

/**
 * Notion 페이지를 Socialing으로 변환
 */
function parseNotionPageToSocialing(page: any): Socialing | null {
  if (!page || !page.id) return null;

  const pageId = page.id;
  const url = page.url || `https://notion.so/${pageId.replace(/-/g, "")}`;

  // 제목 추출
  let title = "";
  for (const [key, value] of Object.entries(page.properties || {})) {
    const prop = value as any;
    if (prop.type === "title" && prop.title) {
      title = extractTextFromProperty(prop) || "";
      break;
    }
  }

  if (!title) return null;

  // 속성 추출
  let description: string | null = null;
  let status: SocialingStatus | null = null;
  let type: SocialingType | null = null;
  let eventDate: EventDate | null = null;
  let participationFee: number | null = null;
  let location: string | null = null;

  for (const [key, value] of Object.entries(page.properties || {})) {
    const prop = value as any;

    // description 찾기
    if (key.toLowerCase() === "description" && prop.type === "rich_text") {
      description = extractTextFromProperty(prop);
    }

    // status 찾기
    if (key.toLowerCase() === "status" && prop.type === "select") {
      status = (extractTextFromProperty(prop) as SocialingStatus) || null;
    }

    // type 찾기
    if (key.toLowerCase() === "type" && prop.type === "select") {
      type = (extractTextFromProperty(prop) as SocialingType) || null;
    }

    // event_date 찾기
    if (
      (key.toLowerCase() === "event_date" ||
        key.toLowerCase() === "eventdate") &&
      prop.type === "date"
    ) {
      eventDate = extractDateRangeFromProperty(prop);
    }

    // participation_fee 찾기
    if (
      (key.toLowerCase() === "participation_fee" ||
        key.toLowerCase() === "participationfee") &&
      prop.type === "number"
    ) {
      participationFee = extractNumberFromProperty(prop);
    }

    // location 찾기
    if (key.toLowerCase() === "location") {
      location = extractTextFromProperty(prop);
    }
  }

  const coverImage = extractCoverImage(page);
  const createdAt = page.created_time || new Date().toISOString();
  const updatedAt = page.last_edited_time || createdAt;

  return {
    pageId,
    title,
    description,
    status: (status || "PENDING") as SocialingStatus,
    type: (type || "SOCIALING") as SocialingType,
    eventDate,
    participationFee,
    location,
    coverImage,
    createdAt,
    updatedAt,
  };
}

/**
 * 소셜링 썸네일 목록 조회 (서버 사이드)
 */
export async function getSocialingThumbnails(): Promise<
  SocialingThumbnail[]
> {
  try {
    const databaseId = process.env.NOTION_SOCIALING_THUMBNAIL_DATABASE_ID;
    if (!databaseId) {
      throw new Error(
        "NOTION_SOCIALING_THUMBNAIL_DATABASE_ID가 설정되지 않았습니다."
      );
    }

    const headers = getNotionHeaders();

    // status 필터: OPEN, PENDING, FINISH만 허용
    const statusInfo = await findPropertyInfo(databaseId, headers, "status");
    const filters: any[] = [];

    if (statusInfo) {
      filters.push({
        or: [
          buildEqualsFilter(statusInfo, "OPEN"),
          buildEqualsFilter(statusInfo, "PENDING"),
          buildEqualsFilter(statusInfo, "FINISH"),
        ].filter(Boolean),
      });
    }

    const queryBody: any = {
      page_size: 100,
    };

    if (filters.length > 0) {
      queryBody.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const queryResponse = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(queryBody),
        next: { revalidate: 600 }, // 10분 캐시
      }
    );

    if (!queryResponse.ok) {
      const errorData = await queryResponse.json().catch(() => ({}));
      console.error("Notion thumbnail query error:", errorData);
      throw new Error(
        `Notion 썸네일 데이터베이스 쿼리 실패: ${
          errorData.message || queryResponse.statusText
        }`
      );
    }

    const data = await queryResponse.json();
    const pages = data.results || [];

    // Notion 페이지를 SocialingThumbnail로 변환
    const thumbnails: SocialingThumbnail[] = [];
    for (const page of pages) {
      const thumbnail = parseNotionPageToThumbnail(page);
      if (thumbnail) {
        thumbnails.push(thumbnail);
      }
    }

    // order로 정렬
    thumbnails.sort((a, b) => a.order - b.order);

    return thumbnails;
  } catch (error) {
    console.error("getSocialingThumbnails error:", error);
    throw error;
  }
}

/**
 * 소셜링 목록 조회 (서버 사이드)
 */
export async function getSocialings(): Promise<Socialing[]> {
  try {
    const databaseId = process.env.NOTION_SOCIALING_DATABASE_ID;
    if (!databaseId) {
      throw new Error("NOTION_SOCIALING_DATABASE_ID가 설정되지 않았습니다.");
    }

    const headers = getNotionHeaders();

    // status 필터: STAGING은 노출하지 않기 위해 OPEN/PENDING/FINISH만 허용
    const statusInfo = await findPropertyInfo(databaseId, headers, "status");
    const filters: any[] = [];

    if (statusInfo) {
      filters.push({
        or: [
          buildEqualsFilter(statusInfo, "OPEN"),
          buildEqualsFilter(statusInfo, "PENDING"),
          buildEqualsFilter(statusInfo, "FINISH"),
        ].filter(Boolean),
      });
    }

    const queryBody: any = {
      page_size: 100,
    };

    if (filters.length > 0) {
      queryBody.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const queryResponse = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(queryBody),
        next: { revalidate: 60 }, // 1분 캐시
      }
    );

    if (!queryResponse.ok) {
      const errorData = await queryResponse.json().catch(() => ({}));
      console.error("Notion socialing query error:", errorData);
      throw new Error(
        `Notion 소셜링 데이터베이스 쿼리 실패: ${
          errorData.message || queryResponse.statusText
        }`
      );
    }

    const data = await queryResponse.json();
    const pages = data.results || [];

    // Notion 페이지를 Socialing으로 변환
    const socialings: Socialing[] = [];
    for (const page of pages) {
      const socialing = parseNotionPageToSocialing(page);
      // 혹시나 쿼리 필터가 적용되지 않는 환경을 대비해, STAGING은 한번 더 차단
      if (socialing && socialing.status !== "STAGING") {
        socialings.push(socialing);
      }
    }

    return socialings;
  } catch (error) {
    console.error("getSocialings error:", error);
    throw error;
  }
}

/**
 * Notion 페이지 ID로 소셜링 조회 (서버 사이드)
 */
export async function getSocialingByPageId(
  pageId: string
): Promise<Socialing | null> {
  try {
    const headers = getNotionHeaders();
    const formattedPageId = formatNotionPageId(pageId);

    const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${formattedPageId}`, {
      method: "GET",
      headers,
      next: { revalidate: 600 }, // 10분 캐시
    });

    if (!pageResponse.ok) {
      if (pageResponse.status === 404) {
        return null;
      }
      const errorData = await pageResponse.json().catch(() => ({}));
      throw new Error(
        `Notion 소셜링 페이지 조회 실패: ${errorData.message || pageResponse.statusText}`
      );
    }

    const page = await pageResponse.json();
    const socialing = parseNotionPageToSocialing(page);
    
    // STAGING 상태는 null 반환
    if (socialing && socialing.status === "STAGING") {
      return null;
    }
    
    return socialing;
  } catch (error) {
    console.error("getSocialingByPageId error:", error);
    throw error;
  }
}

/**
 * 폼 데이터베이스 ID 가져오기
 */
function getFormDatabaseId(type: FormDatabaseType): string {
  const envMap: Record<FormDatabaseType, string> = {
    DORAN_BOOK: process.env.NOTION_DORAN_BOOK_APPLY_DATABASE_ID || "",
    EVENT: process.env.NOTION_EVENT_APPLY_DATABASE_ID || "",
    VIVID: process.env.NOTION_VIVID_APPLY_DATABASE_ID || "",
  };
  const databaseId = envMap[type];
  if (!databaseId) {
    throw new Error(`NOTION_${type}_APPLY_DATABASE_ID가 설정되지 않았습니다.`);
  }
  return databaseId;
}

function extractMaxSelections(fieldName: string): number | undefined {
  const match = fieldName.match(/최대\s*(\d+)\s*개/);
  return match ? parseInt(match[1], 10) : undefined;
}

function detectLongText(
  fieldName: string,
  fieldType: string
): boolean | undefined {
  if (fieldType !== "rich_text") return undefined;
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes("_long") || lowerName.includes("long")) return true;
  if (lowerName.includes("_short") || lowerName.includes("short")) return false;
  return undefined;
}

function extractFieldOrderAndName(fieldName: string): { order?: number; name: string } {
  const match = fieldName.match(/^\s*(\d+)\s*[\.\)\-_:]\s*(.+)\s*$/);
  if (!match) return { name: fieldName.trim() };
  const order = parseInt(match[1], 10);
  const name = (match[2] || "").trim();
  return { order: Number.isFinite(order) ? order : undefined, name: name || fieldName.trim() };
}

/**
 * Notion 폼 스키마 가져오기
 * - options.cache === "no-store"일 때 CSR 용도로 캐시 없이 조회
 */
export async function getNotionFormSchema(
  type: FormDatabaseType,
  submitUrl: string,
  options?: { cache?: RequestCache }
): Promise<NotionFormSchema | null> {
  try {
    const databaseId = getFormDatabaseId(type);
    const headers = getNotionHeaders();

    const dbResponse = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
      method: "GET",
      headers,
      ...(options?.cache === "no-store"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 3600 } }),
    });

    if (!dbResponse.ok) {
      console.error("Notion database fetch failed:", dbResponse.statusText);
      return null;
    }

    const dbData = await dbResponse.json();
    const properties = dbData.properties || {};
    const coverImage = extractCoverImage(dbData);

    const fields: NotionFormField[] = [];
    const supportedTypes: NotionFormFieldType[] = [
      "title",
      "rich_text",
      "number",
      "select",
      "multi_select",
      "date",
      "checkbox",
      "url",
      "email",
      "phone_number",
      "files",
    ];

    for (const [key, value] of Object.entries(properties)) {
      const prop = value as any;
      const propType = prop.type as string;
      if (!supportedTypes.includes(propType as NotionFormFieldType)) continue;

      const rawFieldName = prop.name || key;
      const parsed = extractFieldOrderAndName(rawFieldName);
      const fieldName = parsed.name;

      const field: NotionFormField = {
        id: key,
        name: fieldName,
        type: propType as NotionFormFieldType,
        order: parsed.order,
      };

      // 필수 필드 감지
      if (rawFieldName.includes("필수") || fieldName.includes("필수")) {
        field.required = true;
      }

      // description 추출 (Notion property.description)
      if (prop.description && Array.isArray(prop.description)) {
        const descriptionText = prop.description
          .map((item: any) => item.plain_text || "")
          .join("")
          .trim();
        if (descriptionText) {
          field.description = descriptionText;
        }
      }

      // 필드명 패턴으로 isDescription, isDetail 감지
      const lowerFieldName = fieldName.toLowerCase();
      if (lowerFieldName.includes("설명")) {
        field.isDescription = true;
      }
      if (lowerFieldName.includes("상세")) {
        field.isDetail = true;
      }

      // rich_text 타입의 추가 옵션 추출
      if (propType === "rich_text" && prop.rich_text) {
        const longTextOption = detectLongText(fieldName, propType);
        if (longTextOption !== undefined) {
          field.isLongText = longTextOption;
        }
        
        // placeholder 추출 (rich_text의 경우 Notion API에서 직접 제공하지 않지만,
        // description이나 필드명에서 추출 가능)
        if (field.description) {
          // description이 placeholder 역할을 할 수 있음
          field.placeholder = field.description;
        }
      }

      // number 타입의 validation 추출
      if (propType === "number" && prop.number) {
        const validation: { min?: number; max?: number } = {};
        if (prop.number.min !== undefined) {
          validation.min = prop.number.min;
        }
        if (prop.number.max !== undefined) {
          validation.max = prop.number.max;
        }
        if (Object.keys(validation).length > 0) {
          field.validation = validation;
        }
      }

      // select 타입 옵션 추출
      if (propType === "select" && prop.select?.options) {
        field.options = prop.select.options.map((opt: any) => opt.name);
      }

      // multi_select 타입 옵션 및 max_selections 추출
      if (propType === "multi_select" && prop.multi_select?.options) {
        field.options = prop.multi_select.options.map((opt: any) => opt.name);
        const maxSelections = extractMaxSelections(fieldName);
        if (maxSelections) {
          field.maxSelections = maxSelections;
        }
        if (prop.multi_select?.max_selections) {
          field.maxSelections = prop.multi_select.max_selections;
        }
      }

      fields.push(field);
    }

    fields.sort((a, b) => {
      const ao = a.order ?? Number.POSITIVE_INFINITY;
      const bo = b.order ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name, "ko-KR");
    });

    return {
      databaseId,
      fields,
      submitUrl,
      coverImage,
    };
  } catch (error) {
    console.error("getNotionFormSchema error:", error);
    return null;
  }
}
