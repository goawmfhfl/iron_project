import { SocialingApplyPageClient } from "./SocialingApplyPageClient";
import { getSocialingByPageId } from "@/lib/services/notion-service.server";
import type { Socialing } from "@/lib/types/socialing";

// 소셜링 신청 폼 페이지
// 개발: 3초, 운영: 1일(86400초) 주기로 재생성
const isDev =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development";

export const revalidate = isDev ? 3 : 86400;

interface SocialingApplyPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function SocialingApplyPage({
  params,
}: SocialingApplyPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  // 소셜링 데이터 가져오기 (coverImage fallback용)
  let socialing: Socialing | null = null;
  try {
    socialing = await getSocialingByPageId(id);
  } catch (error) {
    console.error("소셜링 데이터 조회 실패:", error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <SocialingApplyPageClient
          socialingId={id}
          socialing={socialing}
          socialingCoverImage={socialing?.coverImage || null}
        />
      </div>
    </div>
  );
}
