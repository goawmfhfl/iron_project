"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";

export default function ConsumerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { shouldHide } = useScrollDirection({ threshold: 50 });

  const isAdmin = user?.user_metadata?.user_role === "admin";

  const navItems = [
    { href: "/", label: "홈" },
    { href: "/social", label: "소셜링" },
    { href: "/contents", label: "컨텐츠" },
    // { href: "/community", label: "커뮤니티" }, // 개발 예정
  ];

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-sm transition-transform duration-300 ease-in-out",
          shouldHide ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 로고 및 네비게이션 */}
            <div className="flex items-center gap-6">
              {/* 데스크톱 로고 */}
              <Link href="/" className="hidden md:block text-xl font-bold text-text-primary hover:text-primary-600 transition-colors">
                ironProject
              </Link>
              
              {/* 모바일 네비게이션 버튼 (홈/컨텐츠) */}
              <nav className="md:hidden flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              {/* 데스크톱 네비게이션 */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 오른쪽 메뉴 */}
            <div className="flex items-center gap-3">
              {/* 관리자 버튼 */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/admin"}
                  className="hidden sm:flex"
                >
                  어드민
                </Button>
              )}

              {/* 인증 버튼 */}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>
      <main className="w-full">{children}</main>
      <footer className="border-t border-border bg-surface mt-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} ironProject. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
