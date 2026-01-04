import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, elevation = 1, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-lg border border-border",
        `shadow-elevation-${elevation}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

