import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types/socialing-apply";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userRole = (user.user_metadata?.user_role as string) || "user";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("socialing_applications")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `신청 상세 조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("admin socialing-applications detail error:", error);
    return NextResponse.json(
      { error: "신청 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userRole = (user.user_metadata?.user_role as string) || "user";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const status = body?.status as ApplicationStatus | undefined;

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태 값입니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("socialing_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `신청 상태 업데이트 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("admin socialing-applications update error:", error);
    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

