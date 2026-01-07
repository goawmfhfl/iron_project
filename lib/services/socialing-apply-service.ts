import { createClient } from "@/lib/supabase/server";
import type {
  SocialingApplication,
  CreateSocialingApplicationInput,
  GetSocialingApplicationsParams,
  ApplicationStatus,
  UpdateApplicationStatusInput,
} from "@/lib/types/socialing-apply";

export async function createSocialingApplication(
  input: CreateSocialingApplicationInput
): Promise<SocialingApplication> {
  // 필수 필드 검증
  if (!input.user_id) {
    throw new Error("신청 생성 실패: 로그인이 필요합니다.");
  }
  if (!input.user_email) {
    throw new Error("신청 생성 실패: 사용자 이메일이 필요합니다.");
  }
  if (!input.question_answer || input.question_answer.trim().length < 5) {
    throw new Error("신청 생성 실패: 질문 답변은 최소 5글자 이상이어야 합니다.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("socialing_applications")
    .insert({
      socialing_id: input.socialing_id,
      socialing_title: input.socialing_title ?? null,
      user_id: input.user_id,
      user_email: input.user_email,
      user_name: input.user_name ?? null,
      question_answer: input.question_answer.trim(),
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

  if (params?.socialing_id) {
    query = query.eq("socialing_id", params.socialing_id);
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
  input: UpdateApplicationStatusInput
): Promise<SocialingApplication> {
  const supabase = await createClient();
  
  const updateData: {
    status: ApplicationStatus;
    admin_note?: string | null;
  } = {
    status: input.status,
  };

  if (input.admin_note !== undefined) {
    updateData.admin_note = input.admin_note;
  }

  const { data, error } = await supabase
    .from("socialing_applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`신청 상태 업데이트 실패: ${error.message}`);
  }
  return data as SocialingApplication;
}

