export type ContentStatus = "OPEN" | "STOP" | "PENDING";
export type ContentAccess = "FREE" | "MEMBER" | "PRO";

export interface NotionContent {
  pageId: string;
  url: string;
  title: string;
  description: string | null;
  status: ContentStatus;
  access: ContentAccess;
  firstCategory: string | null;
  secondCategory: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotionContentsQueryParams {
  status?: ContentStatus[];
  firstCategory?: string;
  secondCategory?: string;
  pageSize?: number;
  startCursor?: string | null;
}

export interface NotionContentsQueryResult {
  contents: NotionContent[];
  hasMore: boolean;
  nextCursor: string | null;
  totalCount?: number;
}

/**
 * Notion 페이지의 커버 이미지 추출
 */
export function extractCoverImage(page: any): string | null {
  if (!page.cover) return null;

  const cover = page.cover;
  
  // 외부 URL인 경우
  if (cover.type === "external" && cover.external?.url) {
    return cover.external.url;
  }
  
  // Notion 파일인 경우
  if (cover.type === "file" && cover.file?.url) {
    return cover.file.url;
  }

  return null;
}

/**
 * Notion 페이지 속성에서 텍스트 추출
 */
export function extractTextFromProperty(property: any): string | null {
  if (!property) return null;

  switch (property.type) {
    case "title":
      if (property.title && Array.isArray(property.title)) {
        return property.title
          .map((item: any) => item.plain_text || "")
          .join("")
          .trim() || null;
      }
      break;
    case "rich_text":
      if (property.rich_text && Array.isArray(property.rich_text)) {
        return property.rich_text
          .map((item: any) => item.plain_text || "")
          .join("")
          .trim() || null;
      }
      break;
    case "select":
      return property.select?.name || null;
    default:
      return null;
  }

  return null;
}

/**
 * Notion 페이지 속성에서 날짜 추출
 */
export function extractDateFromProperty(property: any): string | null {
  if (!property) return null;

  if (property.type === "date" && property.date?.start) {
    return property.date.start;
  }

  if (property.type === "created_time") {
    return property.created_time;
  }

  if (property.type === "last_edited_time") {
    return property.last_edited_time;
  }

  return null;
}

/**
 * Notion 페이지를 NotionContent로 변환
 */
export function parseNotionPageToContent(page: any): NotionContent | null {
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

  // 속성 추출 (속성 이름으로 찾기)
  let description: string | null = null;
  let status: ContentStatus | null = null;
  let access: ContentAccess | null = null;
  let firstCategory: string | null = null;
  let secondCategory: string | null = null;

  for (const [key, value] of Object.entries(page.properties || {})) {
    const prop = value as any;
    
    // description 찾기 (rich_text 타입)
    if (key.toLowerCase() === "description" && prop.type === "rich_text") {
      description = extractTextFromProperty(prop);
    }
    
    // status 찾기
    if (key.toLowerCase() === "status" && prop.type === "select") {
      status = (extractTextFromProperty(prop) as ContentStatus) || null;
    }
    
    // access 찾기
    if (key.toLowerCase() === "access" && prop.type === "select") {
      access = (extractTextFromProperty(prop) as ContentAccess) || null;
    }
    
    // firstCategory 찾기
    if (key.toLowerCase() === "firstcategory" && prop.type === "select") {
      firstCategory = extractTextFromProperty(prop);
    }
    
    // secondCategory 찾기
    if (key.toLowerCase() === "secondcategory" && prop.type === "select") {
      secondCategory = extractTextFromProperty(prop);
    }
  }

  // 커버 이미지 추출
  const coverImage = extractCoverImage(page);

  // 날짜 추출
  const createdAt = page.created_time || new Date().toISOString();
  const updatedAt = page.last_edited_time || createdAt;

  return {
    pageId,
    url,
    title,
    description,
    status: (status || "PENDING") as ContentStatus,
    access: (access || "FREE") as ContentAccess,
    firstCategory,
    secondCategory,
    coverImage,
    createdAt,
    updatedAt,
  };
}
