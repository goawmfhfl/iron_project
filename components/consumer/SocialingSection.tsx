"use client";

import type { Socialing, SocialingType } from "@/lib/types/socialing";
import { SocialingCard } from "./SocialingCard";
import { Card, CardContent } from "@/components/ui/Card";

interface SocialingSectionProps {
  type: SocialingType;
  socialings: Socialing[];
}

/**
 * 타입별 섹션 제목
 */
function getSectionTitle(type: SocialingType): string {
  switch (type) {
    case "CHALLENGE":
      return "챌린지";
    case "SOCIALING":
      return "소셜링";
    case "EVENT":
      return "이벤트";
    default:
      return "";
  }
}

export function SocialingSection({
  type,
  socialings,
}: SocialingSectionProps) {
  if (socialings.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        {getSectionTitle(type)}
      </h2>

      {socialings.length === 0 ? (
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary">
              {getSectionTitle(type)} 항목이 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {socialings.map((socialing) => (
            <SocialingCard key={socialing.pageId} socialing={socialing} />
          ))}
        </div>
      )}
    </section>
  );
}
