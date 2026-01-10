"use client";

import { useParams } from "next/navigation";
import { SocialingDetailClient } from "./SocialingDetailClient";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function SocialingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  if (!id || typeof id !== "string") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                잘못된 소셜링 ID입니다.
              </p>
              <Button variant="outline" onClick={() => router.push("/social")}>
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <SocialingDetailClient socialingId={id} />
      </div>
    </div>
  );
}
