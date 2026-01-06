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
        {/* CSR로 폼 스키마를 가져오는 페이지 클라이언트 */}
        {/* (파일이 undo로 남아있을 수 있어서 기존 Client 컴포넌트 재사용) */}
        {/*
          NOTE: SocialingApplyPageClient.tsx는 이미 존재하는 상태이므로 import를 추가합니다.
        */}
        {/* @ts-expect-error Server Component에서 Client Component 호출 */}
        {(() => {
          const C = require("./SocialingApplyPageClient").SocialingApplyPageClient;
          return <C socialingId={id} formDatabaseType="DORAN_BOOK" />;
        })()}
      </div>
    </div>
  );
}
