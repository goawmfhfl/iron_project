import { notFound } from "next/navigation";
import {
  getSocialingByPageId,
  getNotionPageContent,
} from "@/lib/services/notion-service.server";
import { formatNotionPageId } from "@/lib/utils/notion";
import { SocialingDetailClient } from "./SocialingDetailClient";

// 개발 환경에서는 빠른 테스트를 위해 revalidate 주기를 짧게,
// 운영 환경에서는 1일(86400초) 기준으로 캐싱
const isDev =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development";

export const revalidate = isDev ? 3 : 86400;

interface SocialingDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function SocialingDetailPage({
  params,
}: SocialingDetailPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  if (!id || typeof id !== "string") {
    console.error("Invalid socialing ID:", id);
    notFound();
  }

  // URL의 ID를 Notion 페이지 ID로 변환 (하이픈 추가)
  let notionPageId: string;
  if (id.length === 32) {
    // 하이픈이 없는 경우 하이픈 추가
    notionPageId = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20, 32)}`;
  } else {
    notionPageId = id;
  }

  try {
    // 소셜링 데이터 가져오기
    const socialing = await getSocialingByPageId(notionPageId);

    if (!socialing) {
      console.error("Socialing not found for pageId:", notionPageId);
      notFound();
    }

    // Notion 페이지 내용 가져오기
    let notionContent = null;
    try {
      // 소셜링의 URL이 Notion 페이지 URL인 경우
      const notionUrl = socialing.pageId
        ? `https://notion.so/${socialing.pageId.replace(/-/g, "")}`
        : null;

      if (notionUrl) {
        notionContent = await getNotionPageContent(notionUrl);
      }
    } catch (error) {
      console.error("Notion 데이터 가져오기 실패:", error);
      notionContent = null;
    }

    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <SocialingDetailClient
            socialing={socialing}
            notionContent={notionContent}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("SocialingDetailPage error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    notFound();
  }
}
