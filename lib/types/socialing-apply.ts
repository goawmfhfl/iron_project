export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SocialingApplication {
  id: string;
  socialing_id: string;
  socialing_title: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  question_answer: string;
  status: ApplicationStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSocialingApplicationInput {
  socialing_id: string;
  socialing_title?: string | null;
  user_id: string;
  user_email: string;
  user_name?: string | null;
  question_answer: string;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  admin_note?: string | null;
}

export interface GetSocialingApplicationsParams {
  socialing_id?: string;
  status?: ApplicationStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}

