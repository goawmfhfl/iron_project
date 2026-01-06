import type { FormDatabaseType } from "@/lib/types/notion-form";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SocialingApplication {
  id: string;
  socialing_id: string;
  form_database_type: FormDatabaseType;
  form_database_id: string;
  applicant_data: Record<string, any>;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface CreateSocialingApplicationInput {
  socialing_id: string;
  form_database_type: FormDatabaseType;
  form_database_id: string;
  applicant_data: Record<string, any>;
  user_id?: string | null;
}

export interface GetSocialingApplicationsParams {
  form_database_type?: FormDatabaseType;
  status?: ApplicationStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}

