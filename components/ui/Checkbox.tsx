import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5 relative">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={cn(
                // 원형 체크박스: appearance-none으로 기본 스타일 제거
                "w-4 h-4 rounded-full border-2 appearance-none peer",
                // 체크되지 않았을 때는 흰색 배경
                "bg-surface-elevated",
                // 체크되었을 때는 primary 색상 배경
                "checked:bg-primary-600 checked:border-primary-600",
                // 포커스 링도 올리브 그린 계열로
                "focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors relative z-10",
                error
                  ? "border-error focus:ring-error"
                  : "border-border hover:border-primary-400",
                className
              )}
              {...props}
            />
            {/* 체크되었을 때 내부에 작은 원 표시 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-4 h-4 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm font-medium cursor-pointer select-none",
                "transition-colors",
                props.disabled
                  ? "text-text-tertiary cursor-not-allowed"
                  : "text-text-primary hover:text-text-secondary",
                error && "text-error"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1.5 ml-7 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

