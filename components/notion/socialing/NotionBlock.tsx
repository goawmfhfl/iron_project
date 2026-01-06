"use client";

import Image from "next/image";
import Link from "next/link";
import { extractTextFromRichText } from "@/lib/services/notion-service";
import { NotionRenderer } from "./NotionRenderer";
import { renderRichText } from "../shared/renderRichText";
import { formatNotionPageId } from "@/lib/utils/notion";
import {
  isThumbnailCallout,
  isDetailCallout,
  isInfoCallout,
  isApplyButtonCallout,
  extractImagesFromCallout,
} from "@/lib/utils/socialing-notion";
import { SocialingDetailThumbnail } from "@/components/consumer/SocialingDetailThumbnail";
import { SocialingDetailImages } from "@/components/consumer/SocialingDetailImages";
import { SocialingDetailInfo } from "@/components/consumer/SocialingDetailInfo";
import type { Socialing } from "@/lib/types/socialing";
import type { NotionBlock } from "@/lib/types/notion";

interface NotionBlockProps {
  block: NotionBlock;
  socialing?: Socialing;
  renderApplyButton?: () => JSX.Element;
}

export function NotionBlock({ block, socialing, renderApplyButton }: NotionBlockProps) {
  const { type, id } = block;

  switch (type) {
    case "paragraph":
      const paragraphText = extractTextFromRichText(block.paragraph?.rich_text);

      if (!paragraphText) {
        return (
          <p
            className="text-base leading-7 mb-2"
            aria-hidden="true"
          >
            {"\u00A0"}
          </p>
        );
      }

      return (
        <p className="text-base text-text-primary leading-7">
          {renderRichText(block.paragraph?.rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-3xl font-bold text-text-primary mb-4 mt-6 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_1?.rich_text)}
          </span>
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-bold text-text-primary mb-3 mt-5 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_2?.rich_text)}
          </span>
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_3?.rich_text)}
          </span>
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-base text-text-primary leading-7 mb-1 ml-6 list-disc">
          {renderRichText(block.bulleted_list_item?.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-base text-text-primary leading-7 mb-1 ml-6 list-decimal">
          {renderRichText(block.numbered_list_item?.rich_text)}
        </li>
      );

    case "quote":
      return (
        <blockquote className="my-6 rounded-xl border border-border bg-surface-elevated px-5 py-4 text-text-secondary">
          <div>
            {block.quote?.rich_text && (
              <p className="text-base leading-relaxed">
                {renderRichText(block.quote?.rich_text)}
              </p>
            )}
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <div className="mt-3">
                <NotionRenderer
                  blocks={block.children}
                  socialing={socialing}
                  renderApplyButton={renderApplyButton}
                />
              </div>
            )}
          </div>
        </blockquote>
      );

    case "code":
      const codeText = extractTextFromRichText(block.code?.rich_text);
      const language = block.code?.language || "plain text";
      return (
        <pre className="bg-surface-elevated border border-border rounded-lg p-4 my-4 overflow-x-auto">
          <code className="text-sm text-text-primary font-mono">
            {codeText}
          </code>
          {language !== "plain text" && (
            <span className="text-xs text-text-tertiary block mt-2">
              {language}
            </span>
          )}
        </pre>
      );

    case "image":
      const imageUrl: string | undefined =
        block.image?.type === "external"
          ? block.image?.external?.url
          : block.image?.file?.url;

      if (!imageUrl) {
        return (
          <div className="my-4 p-4 bg-surface-elevated rounded-lg text-center text-text-tertiary">
            이미지를 불러올 수 없습니다.
          </div>
        );
      }

      const imageCaption = block.image?.caption && block.image.caption.length > 0
        ? extractTextFromRichText(block.image.caption)
        : "이미지";

      return (
        <div className="my-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
            <Image
              src={imageUrl}
              alt={imageCaption}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          {block.image?.caption && block.image.caption.length > 0 && (
            <p className="text-sm text-text-tertiary text-center mt-2 leading-normal">
              {extractTextFromRichText(block.image.caption)}
            </p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-6 border-border" />;

    case "callout":
      // "썸네일" 콜아웃 처리
      if (isThumbnailCallout(block)) {
        const thumbnailImages = extractImagesFromCallout(block);
        if (thumbnailImages.length > 0) {
          return (
            <SocialingDetailThumbnail
              images={thumbnailImages}
              status={socialing?.status}
            />
          );
        }
        return null;
      }

      // "상세페이지" 콜아웃 처리 (상세 이미지들)
      if (isDetailCallout(block)) {
        const detailImages = extractImagesFromCallout(block);
        if (detailImages.length > 0) {
          return <SocialingDetailImages images={detailImages} />;
        }
        return null;
      }

      // "상세정보" 콜아웃 처리 (소셜링 상세 정보 카드)
      if (isInfoCallout(block) && socialing) {
        return <SocialingDetailInfo socialing={socialing} />;
      }

      // "신청버튼" 콜아웃 처리 (신청 버튼 슬롯 렌더링)
      if (isApplyButtonCallout(block) && renderApplyButton) {
        return (
          <div className="my-6">
            {renderApplyButton()}
          </div>
        );
      }

      // 기본 콜아웃 렌더링
      return (
        <div className="border border-border rounded-lg p-4 my-4">
          {block.callout?.icon && (
            <div className="text-2xl mb-2">{block.callout.icon.emoji}</div>
          )}
          <div className="text-base text-text-primary leading-7">
            {block.callout?.rich_text && (
              <p className="mb-2">{renderRichText(block.callout?.rich_text)}</p>
            )}
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <div className="mt-2">
                <NotionRenderer
                  blocks={block.children}
                  socialing={socialing}
                  renderApplyButton={renderApplyButton}
                />
              </div>
            )}
          </div>
        </div>
      );

    case "toggle":
      return (
        <details className="my-4">
          <summary className="cursor-pointer text-base font-medium text-text-primary mb-2 leading-normal">
            {renderRichText(block.toggle?.rich_text)}
          </summary>
          <div className="ml-4 mt-2">
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <NotionRenderer
                blocks={block.children}
                socialing={socialing}
                renderApplyButton={renderApplyButton}
              />
            )}
          </div>
        </details>
      );

    default:
      return (
        <div className="my-2 text-sm text-text-tertiary italic">
          [지원하지 않는 블록 타입: {type}]
        </div>
      );
  }
}
