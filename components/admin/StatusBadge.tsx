"use client";

import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/lib/types/content";

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    종료: {
      label: "종료",
      bgColor: "bg-gray-500/20 dark:bg-gray-500/30",
      textColor: "text-gray-700 dark:text-gray-300",
      borderColor: "border-gray-500/30",
    },
    대기: {
      label: "대기",
      bgColor: "bg-yellow-500/20 dark:bg-yellow-500/30",
      textColor: "text-yellow-700 dark:text-yellow-300",
      borderColor: "border-yellow-500/30",
    },
    오픈: {
      label: "오픈",
      bgColor: "bg-green-500/20 dark:bg-green-500/30",
      textColor: "text-green-700 dark:text-green-300",
      borderColor: "border-green-500/30",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

