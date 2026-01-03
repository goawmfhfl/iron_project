import { Suspense } from "react";
import NotionViewerClient from "./NotionViewerClient";

export default function NotionViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-4 py-10">
          <div className="mx-auto w-full max-w-3xl">
            <div className="text-text-secondary">로딩 중...</div>
          </div>
        </div>
      }
    >
      <NotionViewerClient />
    </Suspense>
  );
}

