"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getNotionContentByPageId } from "@/lib/services/notion-service.server";
import { getNotionPageContent } from "@/lib/services/notion-service";
import { NotionRenderer } from "@/components/notion/content/NotionRenderer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { ContentSkeleton } from "@/components/consumer/ContentSkeleton";
import type { NotionContent } from "@/lib/types/notion-content";
import type { NotionPageContent } from "@/lib/types/notion";
import { formatNotionPageId } from "@/lib/utils/notion";
import { handleImageError } from "@/lib/utils/image-error-handler";

interface ContentDetailClientProps {
  pageId: string;
  initialContent?: NotionContent | null;
  initialNotionContent?: NotionPageContent | null;
}

export function ContentDetailClient({
  pageId,
  initialContent,
  initialNotionContent,
}: ContentDetailClientProps) {
  const router = useRouter();

  // 컨텐츠 데이터 가져오기 (하이드레이션된 데이터 사용)
  const contentQuery = useQuery<NotionContent | null>({
    queryKey: ["notion_content", pageId],
    queryFn: async () => {
      // 클라이언트에서는 서버 함수를 직접 호출할 수 없으므로 API를 통해 호출
      // pageId는 이미 하이픈이 포함된 형식이므로 그대로 사용
      const pageIdForUrl = pageId.replace(/-/g, "");
      const response = await fetch(`/api/notion/content/${pageIdForUrl}`);
      if (!response.ok) {
        throw new Error("컨텐츠를 불러올 수 없습니다.");
      }
      return response.json();
    },
    enabled: !!pageId,
    initialData: initialContent ?? undefined,
    staleTime: 60 * 1000, // 1분
  });

  // Notion 페이지 내용 가져오기 (하이드레이션된 데이터 사용)
  const notionQuery = useQuery({
    queryKey: ["notion_page", contentQuery.data?.url],
    queryFn: () => {
      if (!contentQuery.data?.url) {
        throw new Error("Notion URL이 없습니다.");
      }
      return getNotionPageContent(contentQuery.data.url);
    },
    enabled: !!contentQuery.data?.url,
    initialData: initialNotionContent ?? undefined,
    staleTime: 60 * 1000, // 1분
  });

  // 이미지 에러는 handleImageError에서 직접 페이지 새로고침을 처리하므로
  // 여기서는 이벤트 리스너가 필요 없습니다.

  // 초기 데이터가 없을 때만 스켈레톤 표시
  if (contentQuery.isLoading && !initialContent) {
    return <ContentSkeleton />;
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                컨텐츠를 불러올 수 없습니다.
              </p>
              <Button variant="outline" onClick={() => router.push("/contents")}>
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = contentQuery.data;
  // URL에서 사용할 페이지 ID (하이픈 제거)
  const pageIdForUrl = pageId.replace(/-/g, "");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/contents")}
          className="mb-6"
        >
          ← 목록으로
        </Button>

        {/* 썸네일 (커버 이미지) */}
        {content.coverImage && (
          <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-transparent">
            <Image
              src={content.coverImage}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
              onError={handleImageError}
            />
          </div>
        )}

        {/* 제목 (Description은 제거) */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight">
            <span className="box-decoration-clone bg-background-secondary/35 px-3 py-2 rounded-lg">
              {content.title}
            </span>
          </h1>
        </div>

        {/* Notion 컨텐츠 */}
        {notionQuery.isLoading && !initialNotionContent && <ContentSkeleton />}

        {notionQuery.isError && (
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                Notion 컨텐츠를 불러올 수 없습니다.
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                {notionQuery.error instanceof Error
                  ? notionQuery.error.message
                  : "알 수 없는 오류가 발생했습니다."}
              </p>
              <Button variant="outline" onClick={() => notionQuery.refetch()}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {notionQuery.isSuccess && notionQuery.data && (
          <div className="prose prose-sm max-w-none prose-invert">
            <NotionRenderer
              blocks={notionQuery.data.blocks || []}
              contentId={pageIdForUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
