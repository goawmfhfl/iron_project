import type { NotionFormSchema } from "@/lib/types/notion-form";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SocialingApplication {
  id: string;
  socialing_id: string;
  socialing_title: string | null;
  form_database_type: string;
  form_database_id: string;
  application_round: string | null;
  status: ApplicationStatus;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  form_data: Record<string, any>; // JSONB: 폼 필드별 입력값
  form_schema_snapshot: NotionFormSchema | null; // JSONB: 신청 시점의 폼 스키마 스냅샷
  created_at: string;
  updated_at: string;
}

export interface CreateSocialingApplicationInput {
  socialing_id: string;
  socialing_title?: string | null;
  form_database_type: string;
  form_database_id: string;
  application_round?: string | null;
  form_data: Record<string, any>; // JSONB: 폼 필드별 입력값
  form_schema_snapshot?: NotionFormSchema | null; // JSONB: 신청 시점의 폼 스키마 스냅샷
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
}

export interface GetSocialingApplicationsParams {
  form_database_type?: string;
  status?: ApplicationStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}

