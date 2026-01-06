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
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={cn(
                // 기본 박스 + 올리브 그린 계열 체크 컬러
                "w-4 h-4 rounded border-2 bg-surface text-primary-600",
                // 포커스 링도 올리브 그린 계열로
                "focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors",
                error
                  ? "border-error focus:ring-error"
                  : "border-border hover:border-primary-400",
                className
              )}
              {...props}
            />
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

