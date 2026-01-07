import { Suspense } from "react";
import {
  getSocialingThumbnails,
  getSocialings,
} from "@/lib/services/notion-service.server";
import { SocialingThumbnailCarousel } from "@/components/consumer/SocialingThumbnailCarousel";
import { SocialingSection } from "@/components/consumer/SocialingSection";
import { Card, CardContent } from "@/components/ui/Card";
import type { SocialingType } from "@/lib/types/socialing";

// 소셜링 리스트는 상태 변화가 잦으므로
// 개발 환경: 3초, 운영 환경: 1시간 기준으로 재생성
const isDev =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development";

export const revalidate = isDev ? 3 : 3600;

async function SocialingContent() {
  try {
    // 썸네일과 소셜링 데이터 병렬로 가져오기
    const [thumbnails, socialings] = await Promise.all([
      getSocialingThumbnails(),
      getSocialings(),
    ]);

    // type별로 소셜링 그룹화
    const socialingsByType: Record<SocialingType, typeof socialings> = {
      CHALLENGE: [],
      SOCIALING: [],
      EVENT: [],
    };

    for (const socialing of socialings) {
      if (socialingsByType[socialing.type]) {
        socialingsByType[socialing.type].push(socialing);
      }
    }

    return (
      <>
        {/* 썸네일 캐러셀 */}
        {thumbnails.length > 0 && (
          <SocialingThumbnailCarousel thumbnails={thumbnails} />
        )}

        {/* 소셜링 섹션들 */}
        <SocialingSection
          type="CHALLENGE"
          socialings={socialingsByType.CHALLENGE}
        />
        <SocialingSection
          type="SOCIALING"
          socialings={socialingsByType.SOCIALING}
        />
        <SocialingSection
          type="EVENT"
          socialings={socialingsByType.EVENT}
        />

        {/* 모든 섹션이 비어있는 경우 */}
        {socialings.length === 0 && (
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">
                등록된 소셜링이 없습니다.
              </p>
              <p className="text-sm text-text-tertiary">
                곧 새로운 소셜링이 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </>
    );
  } catch (error) {
    console.error("SocialingContent error:", error);
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error font-semibold mb-4">
            소셜링을 불러오는데 실패했습니다.
          </p>
          <p className="text-sm text-text-tertiary">
            {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }
}

function SocialingSkeleton() {
  return (
    <div className="space-y-8">
      {/* 썸네일 스켈레톤 */}
      <div className="w-full aspect-[16/9] bg-surface-elevated rounded-2xl animate-pulse" />

      {/* 섹션 스켈레톤 */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 w-32 bg-surface-elevated rounded animate-pulse" />
          <div className="space-y-4">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="h-48 bg-surface-elevated rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SocialPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<SocialingSkeleton />}>
          <SocialingContent />
        </Suspense>
      </div>
    </div>
  );
}
