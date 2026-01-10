"use client";

import Image from "next/image";

import { handleImageError } from "@/lib/utils/image-error-handler";

interface SocialingDetailImagesProps {
  images: string[];
}

export function SocialingDetailImages({
  images,
}: SocialingDetailImagesProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {images.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className="relative w-full aspect-auto"
        >
          <div className="relative w-full" style={{ aspectRatio: "auto" }}>
            <Image
              src={imageUrl}
              alt={`상세 이미지 ${index + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={index === 0}
              onError={handleImageError}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
