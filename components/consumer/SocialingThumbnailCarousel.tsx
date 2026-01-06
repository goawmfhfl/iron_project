"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { SocialingThumbnail } from "@/lib/types/socialing";

interface SocialingThumbnailCarouselProps {
  thumbnails: SocialingThumbnail[];
}

export function SocialingThumbnailCarousel({
  thumbnails,
}: SocialingThumbnailCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (thumbnails.length === 0) {
    return null;
  }

  const renderThumbnail = (thumbnail: SocialingThumbnail) => {
    const content = (
      <div className="group relative">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-elevation-1">
          <div className="relative w-full aspect-square">
            {thumbnail.coverImage ? (
              <Image
                src={thumbnail.coverImage}
                alt="썸네일"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1280px"
              />
            ) : (
              <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                <span className="text-text-tertiary">이미지 없음</span>
              </div>
            )}
            {/* PENDING 상태일 때 오버레이 */}
            {thumbnail.status === "PENDING" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="bg-yellow-500/90 dark:bg-yellow-600/90 px-6 py-3 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-bold text-xl tracking-wide">
                    오픈 예정
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // url이 있으면 링크로 감싸기
    if (thumbnail.url) {
      const isExternal = thumbnail.url.startsWith("http");
      
      if (isExternal) {
        return (
          <a
            href={thumbnail.url}
            target="_blank"
            rel="noreferrer noopener"
            className="block"
            aria-label="썸네일 링크로 이동"
          >
            {content}
          </a>
        );
      } else {
        return (
          <Link href={thumbnail.url} className="block" aria-label="썸네일 링크로 이동">
            {content}
          </Link>
        );
      }
    }

    return content;
  };

  return (
    <div className="relative mb-8">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          // @ts-expect-error swiper 내부 타입 호환
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error swiper 내부 타입 호환
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        pagination={{
          clickable: true,
          type: "fraction",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="socialing-thumbnail-carousel"
      >
        {thumbnails.map((thumbnail) => (
          <SwiperSlide key={thumbnail.pageId}>
            {renderThumbnail(thumbnail)}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 네비게이션 버튼 */}
      {thumbnails.length > 1 && (
        <>
          <button
            ref={prevRef}
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label="이전 슬라이드"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            ref={nextRef}
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label="다음 슬라이드"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      <style jsx global>{`
        .socialing-thumbnail-carousel .swiper-pagination {
          bottom: 20px;
          text-align: center;
          color: white;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
