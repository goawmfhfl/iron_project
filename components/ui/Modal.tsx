"use client";

import { useEffect, useRef } from "react";
import { useModalStore } from "@/lib/stores/modal-store";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Modal() {
  const { isOpen, config, closeModal } = useModalStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeModal]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 포커스 트랩 (접근성)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modalElement.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => {
      modalElement.removeEventListener("keydown", handleTab);
    };
  }, [isOpen, config]);

  if (!isOpen || !config) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <Card
        ref={modalRef}
        elevation={3}
        className={cn(
          "relative z-10 w-full max-w-md",
          "transform transition-all duration-200 ease-out"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <h2
            id="modal-title"
            className="text-xl font-bold text-text-primary"
          >
            {config.title}
          </h2>
        </CardHeader>

        <CardContent className="space-y-6">
          <p
            id="modal-description"
            className="text-text-secondary leading-relaxed"
          >
            {config.message}
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            {config.secondaryAction && (
              <Button
                variant="outline"
                onClick={config.secondaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {config.secondaryAction.label}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={config.primaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {config.primaryAction.label}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
