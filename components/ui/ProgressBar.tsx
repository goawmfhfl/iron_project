"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number; // 현재 단계 (1부터 시작)
  total: number; // 전체 단계 수
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-semibold text-text-primary">
          진행률
        </span>
        <span className="text-sm font-medium text-text-secondary">
          {current} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
