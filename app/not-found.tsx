import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-text-tertiary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>홈으로 가기</Button>
          </Link>
          <Link href="/contents">
            <Button variant="outline">컨텐츠 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
