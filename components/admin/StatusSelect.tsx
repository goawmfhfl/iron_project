"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpdateContentStatus } from "@/lib/hooks/useContentStatus";
import type { ContentStatus } from "@/lib/types/content";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  contentId: string;
  currentStatus: ContentStatus;
  className?: string;
  variant?: "compact" | "form";
  label?: string;
}

export function StatusSelect({
  contentId,
  currentStatus,
  className,
  variant = "compact",
  label,
}: StatusSelectProps) {
  const updateStatusMutation = useUpdateContentStatus();
  const [value, setValue] = useState<ContentStatus>(currentStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValue(currentStatus);
  }, [currentStatus]);

  const statuses: ContentStatus[] = useMemo(() => ["종료", "대기", "오픈"], []);
  const options = useMemo(
    () => statuses.map((s) => ({ value: s, label: s })),
    [statuses]
  );

  const handleChange = async (newStatus: ContentStatus) => {
    if (newStatus === value) return;
    const prev = value;
    setErrorMessage(null);
    setValue(newStatus);
    try {
      await updateStatusMutation.mutateAsync({
        id: contentId,
        status: newStatus,
      });
    } catch (error) {
      console.error("상태 변경 실패:", error);
      setValue(prev);
      setErrorMessage("상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className={cn("min-w-[120px]", variant === "compact" && "min-w-[110px]", className)}>
      <Select
        label={variant === "form" ? label ?? "상태" : undefined}
        value={value}
        options={options}
        disabled={updateStatusMutation.isPending}
        error={errorMessage ?? undefined}
        onChange={(e) => handleChange(e.target.value as ContentStatus)}
        className={cn(
          variant === "compact" && "py-1.5 px-3 text-sm",
          variant === "form" && "text-sm"
        )}
      />
    </div>
  );
}

