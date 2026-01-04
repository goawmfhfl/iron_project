import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound, redirect } from "next/navigation";
import {
  getNotionContentByPageId,
  getNotionPageContent,
} from "@/lib/services/notion-service.server";
import { checkContentAccessServer } from "@/lib/services/content-access";
import { formatNotionPageId } from "@/lib/utils/notion";
import { ContentDetailClient } from "./ContentDetailClient";
import { getNotionContentsDatabase } from "@/lib/services/notion-service.server";
import type { ContentStatus } from "@/lib/types/notion-content";

export const revalidate = 3600; // 1시간마다 재생성

/**
 * 모든 컨텐츠 페이지 ID를 반환하여 정적 페이지 생성
 */
export async function generateStaticParams() {
  try {
    // OPEN 상태인 컨텐츠만 반환
    const result = await getNotionContentsDatabase({
      status: ["OPEN"],
      pageSize: 100, // 최대 100개까지
    });

    const params = result.contents.map((content) => {
      // Notion 페이지 ID를 URL 형식으로 변환 (하이픈 제거)
      const pageIdForUrl = content.pageId.replace(/-/g, "");
      return {
        id: pageIdForUrl,
      };
    });

    console.log(`generateStaticParams: ${params.length}개의 정적 페이지 생성`);
    return params;
  } catch (error) {
    console.error("generateStaticParams error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // 빌드 실패를 방지하기 위해 빈 배열 반환
    return [];
  }
}

interface ContentDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  // Next.js 14.2.5에서는 params가 Promise일 수도 있고 아닐 수도 있음
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  if (!id || typeof id !== "string") {
    console.error("Invalid content ID:", id);
    notFound();
  }

  // URL의 ID를 Notion 페이지 ID로 변환 (하이픈 추가)
  // format: 32자리 hex -> 8-4-4-4-12 형식
  let notionPageId: string;
  if (id.length === 32) {
    // 하이픈이 없는 경우 하이픈 추가
    notionPageId = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20, 32)}`;
  } else {
    notionPageId = id;
  }

  // QueryClient 생성 (서버 사이드)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
      },
    },
  });

  try {
    // Notion 컨텐츠 메타데이터 가져오기
    const contentData = await queryClient.fetchQuery({
      queryKey: ["notion_content", notionPageId],
      queryFn: async () => {
        try {
          return await getNotionContentByPageId(notionPageId);
        } catch (error) {
          console.error("getNotionContentByPageId error:", error);
          throw error;
        }
      },
    });

    if (!contentData) {
      console.error("Content not found for pageId:", notionPageId);
      notFound();
    }

    // 접근 권한 체크
    const accessCheck = await checkContentAccessServer(contentData.access);
    if (!accessCheck.allowed) {
      // 접근 불가 시 리다이렉트 또는 에러 페이지 표시
      if (accessCheck.requiresAuth) {
        redirect("/login?redirect=/contents/" + id);
      } else if (accessCheck.requiresPremium) {
        // 프리미엄 필요 시 특별한 페이지로 리다이렉트
        redirect("/contents?error=premium_required");
      } else {
        notFound();
      }
    }

    // Notion 페이지 내용 가져오기
    let notionData = null;
    try {
      notionData = await queryClient.fetchQuery({
        queryKey: ["notion_page", contentData.url],
        queryFn: async () => {
          try {
            return await getNotionPageContent(contentData.url);
          } catch (error) {
            console.error("getNotionPageContent error:", error);
            return null;
          }
        },
      });
    } catch (error) {
      console.error("Notion 데이터 가져오기 실패:", error);
      notionData = null;
    }

    // React Query 상태를 직렬화하여 클라이언트에 전달
    const dehydratedState = dehydrate(queryClient);

    return (
      <HydrationBoundary state={dehydratedState}>
        <ContentDetailClient
          pageId={notionPageId}
          initialContent={contentData}
          initialNotionContent={notionData}
        />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("ContentDetailPage error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    notFound();
  }
}
