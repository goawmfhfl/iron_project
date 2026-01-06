"use client";

import { useEffect, useState, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

/**
 * 스크롤 방향을 감지하는 커스텀 훅
 * @returns 스크롤 방향 ('up' | 'down' | null)
 */
export function useScrollDirection(): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      // 스크롤 위치가 변경되지 않았으면 무시
      if (scrollY === lastScrollY) {
        ticking = false;
        return;
      }

      // 스크롤 방향 결정
      const direction = scrollY > lastScrollY ? "down" : "up";
      
      // 최상단에서는 항상 null (애니메이션 없음)
      if (scrollY <= 0) {
        setScrollDirection(null);
      } else {
        setScrollDirection(direction);
      }

      lastScrollYRef.current = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // 초기 스크롤 위치 설정
    lastScrollYRef.current = window.scrollY;

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollDirection;
}
