import { FormTestClient } from "./FormTestClient";

export default function FormTestPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Notion 폼 스키마 테스트
          </h1>
          <p className="text-text-secondary">
            Notion 데이터베이스의 원본 속성과 파싱된 폼 필드를 비교해 확인할 수 있습니다.
          </p>
        </div>
        <FormTestClient />
      </div>
    </div>
  );
}
