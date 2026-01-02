"use client";

import { useState } from "react";
import { useUpdateContentStatus } from "@/lib/hooks/useContentStatus";
import { StatusBadge } from "./StatusBadge";
import type { ContentStatus } from "@/lib/types/content";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  contentId: string;
  currentStatus: ContentStatus;
  className?: string;
}

export function StatusSelect({
  contentId,
  currentStatus,
  className,
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateStatusMutation = useUpdateContentStatus();

  const statuses: ContentStatus[] = ["종료", "대기", "오픈"];

  const handleStatusChange = async (newStatus: ContentStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: contentId,
        status: newStatus,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={updateStatusMutation.isPending}
        className="flex items-center gap-2"
      >
        <StatusBadge status={currentStatus} />
        {updateStatusMutation.isPending ? (
          <span className="text-xs text-text-tertiary">변경 중...</span>
        ) : (
          <svg
            className={cn(
              "w-4 h-4 text-text-tertiary transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-20 bg-surface border border-surface-elevated rounded-lg shadow-elevation-2 min-w-[120px]">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={updateStatusMutation.isPending}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-surface-hover transition-colors first:rounded-t-lg last:rounded-b-lg",
                  status === currentStatus && "bg-primary-50 dark:bg-primary-900/20"
                )}
              >
                <StatusBadge status={status} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

