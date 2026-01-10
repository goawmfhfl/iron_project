/**
 * 이미지 에러 발생 시 Notion 데이터를 다시 가져오기 위한 유틸리티
 */

import type { SyntheticEvent } from 'react';

// 전역 이벤트 타입
export const IMAGE_ERROR_EVENT = 'notion-image-error';

/**
 * 이미지 에러 핸들러 래퍼
 * Next.js Image의 onError 이벤트를 처리하고 에러 정보를 추출합니다.
 * "upstream response is invalid" 에러를 포함한 모든 Next.js Image 최적화 에러를 감지합니다.
 */
export function handleImageError(event: SyntheticEvent<HTMLImageElement, Event>) {
  const target = event.currentTarget;
  const src = target.src || '';
  
  // 에러 정보 추출
  const errorInfo = {
    src,
    type: target.getAttribute('data-error-type') || 'unknown',
    timestamp: Date.now(),
  };
  
  // 콘솔에서 에러 메시지 확인 시도 (Next.js Image 최적화 에러 포함)
  const errorMessage = (event.nativeEvent as any)?.error?.message || '';
  
  console.warn("이미지 로드 에러 감지:", {
    ...errorInfo,
    errorMessage,
    isNotionImage: src.includes('notion') || src.includes('amazonaws.com'),
  });
  
  // Notion 이미지인 경우에만 refetch 트리거
  const isNotionImage = src.includes('notion') || 
                       src.includes('amazonaws.com') || 
                       src.includes('notion-static.com') ||
                       src.includes('notion.so');
  
  if (isNotionImage) {
    triggerNotionDataRefetch(errorInfo);
  }
}

/**
 * 이미지 에러 이벤트 발생
 * 이 함수는 이미지 컴포넌트의 onError에서 호출됩니다.
 * Next.js Image의 "upstream response is invalid" 에러도 포함하여 처리합니다.
 * 이미지 에러 발생 시 페이지를 새로고침하여 새로운 데이터를 불러옵니다.
 */
export function triggerNotionDataRefetch(errorInfo?: any) {
  // 이미 리로드를 시도했는지 확인
  const hasReloaded = sessionStorage.getItem("image-error-reload");
  if (!hasReloaded) {
    sessionStorage.setItem("image-error-reload", "true");
    
    console.warn("Notion 이미지 에러 감지 - 페이지 새로고침", errorInfo);
    
    // 즉시 페이지 새로고침하여 새로운 Notion 데이터를 불러옴
    // ISR이 1시간으로 설정되어 있으므로 새로고침 시 최신 이미지 URL을 받아옴
    if (typeof window !== 'undefined') {
      // 약간의 지연을 두어 여러 이미지 에러가 동시에 발생해도 한 번만 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }
}

/**
 * 이미지 에러 리로드 플래그 초기화
 * Notion 데이터가 성공적으로 다시 로드되면 호출됩니다.
 */
export function clearImageErrorReloadFlag() {
  sessionStorage.removeItem("image-error-reload");
}
