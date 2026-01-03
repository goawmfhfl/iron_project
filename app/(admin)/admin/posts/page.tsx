"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAllContents, deleteContent } from "@/lib/services/content-service";
import { StatusSelect } from "@/components/admin/StatusSelect";

export default function PostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const contentsQuery = useQuery({
    queryKey: ["read_margnet", "all"],
    queryFn: getAllContents,
  });


  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["read_margnet", "all"] });
    },
    onError: (error) => {
      console.error("컨텐츠 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    deleteMutation.mutate(id);
  };

  if (contentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (contentsQuery.isError) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-text-secondary mb-4">
            컨텐츠를 불러오지 못했습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => contentsQuery.refetch()}
            disabled={contentsQuery.isFetching}
          >
            {contentsQuery.isFetching ? "다시 시도 중..." : "다시 시도"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const contents = contentsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            컨텐츠 관리
          </h1>
          <p className="text-text-secondary">
            컨텐츠를 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/admin/posts/new")}
        >
          컨텐츠 생성하기
        </Button>
      </div>

      {contents.length === 0 ? (
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">
              등록된 컨텐츠가 없습니다.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/admin/posts/new")}
            >
              첫 컨텐츠 생성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <Card key={content.id} elevation={2} className="flex flex-col h-[500px]">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-1 flex-1">
                    {content.title}
                  </h3>
                  <StatusSelect
                    contentId={content.id}
                    currentStatus={content.status}
                    variant="compact"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                {content.thumbnail_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-full h-auto rounded-lg border border-surface-elevated object-cover"
                      style={{ maxHeight: "180px" }}
                    />
                  </div>
                )}
                <p className="text-sm text-text-secondary line-clamp-2 flex-shrink-0">
                  {content.description}
                </p>
                <div className="text-xs text-text-tertiary flex-shrink-0">
                  <div>
                    생성일:{" "}
                    {new Date(content.created_at).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-surface-elevated mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/admin/posts/${content.id}/preview`)
                    }
                  >
                    미리보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/admin/posts/${content.id}/edit`)
                    }
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(content.id)}
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === content.id
                    }
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === content.id
                      ? "삭제 중..."
                      : "삭제"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
