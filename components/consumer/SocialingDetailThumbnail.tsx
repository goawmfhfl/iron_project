"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface SocialingDetailThumbnailProps {
  images: string[];
  status?: "OPEN" | "PENDING" | "FINISH" | "STAGING";
}

export function SocialingDetailThumbnail({
  images,
  status,
}: SocialingDetailThumbnailProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-8">
      {/* 메인 이미지 캐러셀 */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
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
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="socialing-detail-thumbnail-main"
        >
          {images.map((imageUrl, index) => (
            <SwiperSlide key={`${imageUrl}-${index}`}>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-elevated">
                <Image
                  src={imageUrl}
                  alt={`썸네일 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1280px"
                  priority={index === 0}
                />
                {/* PENDING 상태일 때 오버레이 */}
                {status === "PENDING" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-yellow-500/90 dark:bg-yellow-600/90 px-6 py-3 rounded-lg backdrop-blur-sm">
                      <span className="text-white font-bold text-xl tracking-wide">
                        오픈 예정
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 네비게이션 버튼 */}
        {images.length > 1 && (
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
      </div>

      {/* 썸네일 네비게이션 (선택사항) */}
      {images.length > 1 && (
        <div className="mt-4">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            className="socialing-detail-thumbnail-thumbs"
          >
            {images.map((imageUrl, index) => (
              <SwiperSlide
                key={`thumb-${imageUrl}-${index}`}
                className="!w-auto cursor-pointer"
              >
                <div
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeIndex === index
                      ? "border-primary-500"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`썸네일 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <style jsx global>{`
        .socialing-detail-thumbnail-main .swiper-pagination {
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
