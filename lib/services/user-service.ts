"use client";

import { supabase } from "@/lib/supabase/client";
import type { AdminUser, UpdateUserInput } from "@/lib/types/user";

/**
 * 모든 회원 조회
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("get_all_users");

  if (error) {
    throw new Error(`회원 목록 조회 실패: ${error.message}`);
  }

  return (data || []).map((user: any) => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    phone: user.phone,
    gender: user.gender,
    nickname: user.nickname,
    user_role: (user.user_role || "user") as "admin" | "user" | "premium_user",
    confirmed_at: user.confirmed_at,
    last_sign_in_at: user.last_sign_in_at,
    updated_at: user.updated_at,
    banned_until: user.banned_until,
    is_anonymous: user.is_anonymous,
    is_sso_user: user.is_sso_user,
  }));
}

/**
 * 특정 회원 조회
 */
export async function getUserById(id: string): Promise<AdminUser | null> {
  const { data, error } = await supabase.rpc("get_user_by_id", {
    user_id: id,
  });

  if (error) {
    throw new Error(`회원 조회 실패: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const user = data[0];
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    phone: user.phone,
    gender: user.gender,
    nickname: user.nickname,
    user_role: (user.user_role || "user") as "admin" | "user" | "premium_user",
    confirmed_at: user.confirmed_at,
    last_sign_in_at: user.last_sign_in_at,
    updated_at: user.updated_at,
    banned_until: user.banned_until,
    is_anonymous: user.is_anonymous,
    is_sso_user: user.is_sso_user,
  };
}

/**
 * 회원 정보 수정
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<void> {
  // 현재 사용자 정보 가져오기
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error("인증이 필요합니다.");
  }

  const currentRole =
    (currentUser.user_metadata?.user_role as string) || "user";
  if (currentRole !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }

  // 수정할 사용자 정보 가져오기
  const targetUser = await getUserById(id);
  if (!targetUser) {
    throw new Error("회원을 찾을 수 없습니다.");
  }

  // user_metadata 업데이트
  const updatedMetadata = {
    ...targetUser,
    ...input,
  };

  // email은 별도로 업데이트해야 함 (Admin API 필요)
  // 여기서는 user_metadata만 업데이트
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      phone: input.phone ?? targetUser.phone,
      gender: input.gender ?? targetUser.gender,
      nickname: input.nickname ?? targetUser.nickname,
      user_role: input.user_role ?? targetUser.user_role,
    },
  });

  if (updateError) {
    throw new Error(`회원 정보 수정 실패: ${updateError.message}`);
  }

  // email 변경은 Supabase Admin API가 필요하므로
  // 현재는 user_metadata만 업데이트 가능합니다.
  // email 변경이 필요한 경우 Supabase Dashboard에서 수동으로 변경하거나
  // Service Role Key를 사용한 서버 사이드 API를 구현해야 합니다.
  if (input.email && input.email !== targetUser.email) {
    console.warn(
      "Email 변경은 현재 지원되지 않습니다. Supabase Dashboard에서 수동으로 변경해주세요."
    );
    // email 변경은 무시하고 나머지 필드만 업데이트
  }
}

