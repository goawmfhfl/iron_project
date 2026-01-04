import type { ContentAccess } from "@/lib/types/notion-content";
import type { UserRole } from "@/lib/types/user";
import { getCurrentUser } from "@/lib/auth/auth";

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiresAuth?: boolean;
  requiresPremium?: boolean;
}

/**
 * 컨텐츠 접근 권한 체크
 */
export async function checkContentAccess(
  access: ContentAccess,
  userRole?: UserRole | null
): Promise<AccessCheckResult> {
  switch (access) {
    case "FREE":
      // 누구나 접근 가능
      return {
        allowed: true,
      };

    case "MEMBER":
      // 로그인한 유저만 접근 가능
      if (!userRole) {
        return {
          allowed: false,
          reason: "이 컨텐츠는 회원만 볼 수 있습니다.",
          requiresAuth: true,
        };
      }
      return {
        allowed: true,
      };

    case "PRO":
      // premium_user 역할만 접근 가능
      if (!userRole || userRole !== "premium_user") {
        return {
          allowed: false,
          reason: "이 컨텐츠는 프리미엄 회원만 볼 수 있습니다.",
          requiresPremium: true,
        };
      }
      return {
        allowed: true,
      };

    default:
      return {
        allowed: false,
        reason: "알 수 없는 접근 권한입니다.",
      };
  }
}

/**
 * 서버 사이드에서 컨텐츠 접근 권한 체크
 */
export async function checkContentAccessServer(
  access: ContentAccess
): Promise<AccessCheckResult> {
  try {
    const { user } = await getCurrentUser();
    const userRole = (user?.user_metadata?.user_role as UserRole) || null;

    return checkContentAccess(access, userRole);
  } catch (error) {
    // 인증 실패 시 비회원으로 처리
    return checkContentAccess(access, null);
  }
}

/**
 * 접근 권한에 따른 뱃지 텍스트 반환
 */
export function getAccessBadgeText(access: ContentAccess): string {
  switch (access) {
    case "FREE":
      return "누구나";
    case "MEMBER":
      return "멤버 전용";
    case "PRO":
      return "프리미엄";
    default:
      return "";
  }
}

/**
 * 접근 권한에 따른 뱃지 색상 클래스 반환
 */
export function getAccessBadgeColorClass(access: ContentAccess): string {
  switch (access) {
    case "FREE":
      return "bg-success/10 text-success border-success/20";
    case "MEMBER":
      return "bg-primary/10 text-primary border-primary/20";
    case "PRO":
      return "bg-secondary/10 text-secondary border-secondary/20";
    default:
      return "bg-surface-elevated text-text-secondary border-border";
  }
}
