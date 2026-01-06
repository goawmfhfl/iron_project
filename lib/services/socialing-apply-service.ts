import { createClient } from "@/lib/supabase/server";
import type {
  SocialingApplication,
  CreateSocialingApplicationInput,
  GetSocialingApplicationsParams,
  ApplicationStatus,
} from "@/lib/types/socialing-apply";

export async function createSocialingApplication(
  input: CreateSocialingApplicationInput
): Promise<SocialingApplication> {
  // user_id는 필수 (인증된 사용자만 신청 가능)
  if (!input.user_id) {
    throw new Error("신청 생성 실패: 로그인이 필요합니다.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("socialing_applications")
    .insert({
      socialing_id: input.socialing_id,
      socialing_title: input.socialing_title ?? null,
      form_database_type: input.form_database_type,
      form_database_id: input.form_database_id,
      application_round: input.application_round ?? null,
      form_data: input.form_data,
      form_schema_snapshot: input.form_schema_snapshot ?? null,
      user_id: input.user_id,
      user_email: input.user_email ?? null,
      user_name: input.user_name ?? null,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`신청 생성 실패: ${error.message}`);
  }

  return data as SocialingApplication;
}

export async function getSocialingApplications(params?: GetSocialingApplicationsParams): Promise<{
  applications: SocialingApplication[];
  total: number;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("socialing_applications")
    .select("*", { count: "exact" });

  if (params?.form_database_type) {
    query = query.eq("form_database_type", params.form_database_type);
  }
  if (params?.status) {
    query = query.eq("status", params.status);
  }
  if (params?.start_date) {
    query = query.gte("created_at", params.start_date);
  }
  if (params?.end_date) {
    query = query.lte("created_at", params.end_date);
  }

  query = query.order("created_at", { ascending: false });

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`신청 목록 조회 실패: ${error.message}`);
  }

  return {
    applications: (data ?? []) as SocialingApplication[],
    total: count ?? 0,
  };
}

// application_round로 필터링하는 함수 (향후 확장용)
export async function getSocialingApplicationsByRound(
  applicationRound: string
): Promise<SocialingApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("socialing_applications")
    .select("*")
    .eq("application_round", applicationRound)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`신청회차별 조회 실패: ${error.message}`);
  }

  return (data ?? []) as SocialingApplication[];
}

export async function getSocialingApplicationById(
  id: string
): Promise<SocialingApplication | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("socialing_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`신청 상세 조회 실패: ${error.message}`);
  }
  return data as SocialingApplication;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<SocialingApplication> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("socialing_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`신청 상태 업데이트 실패: ${error.message}`);
  }
  return data as SocialingApplication;
}

