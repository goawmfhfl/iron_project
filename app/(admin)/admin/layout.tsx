"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/posts", label: "콘텐츠 관리" },
    { href: "/admin/users", label: "회원 관리" },
    { href: "/admin/settings", label: "설정" },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-surface border-r border-surface-elevated">
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-surface-elevated">
              <h1 className="text-xl font-bold text-text-primary">
                ironProject
              </h1>
              <span className="ml-2 text-sm text-text-secondary">Admin</span>
            </div>
            <nav className="flex-1 flex flex-col overflow-y-auto py-6 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-2",
                    pathname === item.href
                      ? "text-text-primary bg-surface-hover"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-elevated lg:hidden">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 px-6 border-b border-surface-elevated">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-text-primary">
                      ironProject
                    </h1>
                    <span className="ml-2 text-sm text-text-secondary">Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center transition-colors"
                    aria-label="메뉴 닫기"
                  >
                    <svg
                      className="w-5 h-5 text-text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 flex flex-col overflow-y-auto py-6 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-2",
                        pathname === item.href
                          ? "text-text-primary bg-surface-hover"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Navigation */}
          <header className="w-full border-b border-surface-elevated bg-surface">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-lg hover:bg-surface-hover flex items-center justify-center transition-colors"
                  aria-label="메뉴 열기"
                >
                  <svg
                    className="w-6 h-6 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-text-primary lg:hidden">
                  Admin
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* 홈 이동 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/"}
                  className="hidden sm:flex"
                >
                  홈
                </Button>
                <Link
                  href="/"
                  className="sm:hidden w-10 h-10 rounded-lg hover:bg-surface-hover flex items-center justify-center transition-colors"
                  aria-label="홈으로 이동"
                >
                  <svg
                    className="w-5 h-5 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
