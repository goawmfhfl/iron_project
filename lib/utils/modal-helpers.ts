import type { ModalConfig } from "@/lib/types/modal";

/**
 * 로그인 필요 모달 설정 생성
 */
export function createLoginRequiredModal(
  contentId: string,
  onLogin: () => void,
  onCancel: () => void
): ModalConfig {
  return {
    type: "LOGIN_REQUIRED",
    title: "회원전용 컨텐츠",
    message: "이 컨텐츠는 회원만 볼 수 있습니다. 로그인 하시겠어요?",
    primaryAction: {
      label: "로그인하기",
      onClick: onLogin,
    },
    secondaryAction: {
      label: "취소",
      onClick: onCancel,
    },
  };
}

/**
 * 프리미엄 필요 모달 설정 생성
 */
export function createPremiumRequiredModal(
  onSubscribe: () => void,
  onCancel: () => void
): ModalConfig {
  return {
    type: "PREMIUM_REQUIRED",
    title: "프리미엄 회원 전용",
    message: "이 컨텐츠는 프리미엄 회원만 볼 수 있는 컨텐츠입니다. 구독을 하시겠어요?",
    primaryAction: {
      label: "구독하기",
      onClick: onSubscribe,
    },
    secondaryAction: {
      label: "취소",
      onClick: onCancel,
    },
  };
}
