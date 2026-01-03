"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import type { NotionPageContent } from "@/lib/types/notion";

export default function NotionViewerClient() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("pageUrl") ?? "";
  const [pageUrl, setPageUrl] = useState(initial);

  const trimmedUrl = useMemo(() => pageUrl.trim(), [pageUrl]);

  const query = useQuery<NotionPageContent>({
    queryKey: ["notion_viewer", trimmedUrl],
    queryFn: async () => {
      const res = await fetch(`/api/notion?pageUrl=${encodeURIComponent(trimmedUrl)}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (json && (json.error as string)) || `요청 실패: ${res.status} ${res.statusText}`
        );
      }
      return json as NotionPageContent;
    },
    enabled: !!trimmedUrl,
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card elevation={1}>
          <CardHeader>
            <h1 className="text-xl font-semibold text-text-primary">Notion 페이지 보기</h1>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                label="Notion 페이지 URL 또는 페이지 ID"
                placeholder="https://www.notion.so/... 또는 /<pageId> 또는 <pageId>"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    query.refetch();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  disabled={!trimmedUrl || query.isFetching}
                  onClick={() => query.refetch()}
                >
                  {query.isFetching ? "불러오는 중..." : "불러오기"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {query.isError && (
          <Card elevation={1}>
            <CardContent className="py-6">
              <p className="text-error font-semibold mb-2">Notion 컨텐츠를 불러올 수 없습니다.</p>
              <p className="text-sm text-text-tertiary">
                {query.error instanceof Error ? query.error.message : "알 수 없는 오류"}
              </p>
            </CardContent>
          </Card>
        )}

        {query.isSuccess && (
          <Card elevation={1}>
            <CardContent className="py-8">
              {query.data.title && (
                <h2 className="text-2xl font-bold text-text-primary mb-4">{query.data.title}</h2>
              )}
              <NotionRenderer blocks={query.data.blocks || []} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

