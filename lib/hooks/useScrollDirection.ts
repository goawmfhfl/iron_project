"use client";

import { useEffect, useState, useRef } from "react";

interface UseScrollDirectionOptions {
  threshold?: number; // 스크롤 임계값 (기본값: 50px)
}

interface UseScrollDirectionReturn {
  direction: "up" | "down" | null;
  isAtTop: boolean;
  shouldHide: boolean; // 숨김 여부 (임계값 초과 + 스크롤 다운)
}

/**
 * 스크롤 방향과 위치를 추적하는 커스텀 훅
 * @param options - 설정 옵션
 * @returns 스크롤 방향, 최상단 여부, 숨김 여부
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 50 } = options;
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [shouldHide, setShouldHide] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 최상단 여부 확인
          const atTop = currentScrollY < threshold;
          setIsAtTop(atTop);

          // 스크롤 방향 결정
          if (currentScrollY > lastScrollY.current) {
            // 스크롤 다운
            setDirection("down");
            // 임계값 초과 + 스크롤 다운이면 숨김
            setShouldHide(currentScrollY >= threshold);
          } else if (currentScrollY < lastScrollY.current) {
            // 스크롤 업
            setDirection("up");
            // 스크롤 업이면 항상 표시
            setShouldHide(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    // 초기 스크롤 위치 설정
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < threshold);
    setShouldHide(false);

    // 스크롤 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { direction, isAtTop, shouldHide };
}
