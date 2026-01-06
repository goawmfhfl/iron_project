import { Card, CardContent } from "@/components/ui/Card";

interface SocialingApplyPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function SocialingApplyPage({
  params,
}: SocialingApplyPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">
              신청하기 페이지는 준비 중입니다.
            </p>
            <p className="text-sm text-text-tertiary">
              곧 이용하실 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
