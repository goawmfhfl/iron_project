export type UserRole = "admin" | "user" | "premium_user";
export type Gender = "남성" | "여성" | "기타";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  phone: string | null;
  gender: Gender | null;
  nickname: string | null;
  user_role: UserRole;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  updated_at: string;
  banned_until: string | null;
  is_anonymous: boolean;
  is_sso_user: boolean;
}

export interface UpdateUserInput {
  email?: string;
  phone?: string;
  gender?: Gender;
  nickname?: string;
  user_role?: UserRole;
}

