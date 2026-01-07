import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSocialingApplications } from "@/lib/services/socialing-apply-service";
import type { ApplicationStatus } from "@/lib/types/socialing-apply";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") || 20))
    );

    const socialingId = searchParams.get("socialing_id") || "";
    const status = (searchParams.get("status") || "") as ApplicationStatus | "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    const { applications, total } = await getSocialingApplications({
      socialing_id: socialingId || undefined,
      status: status || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      page,
      pageSize,
    });

    return NextResponse.json({
      applications,
      total,
    });
  } catch (error) {
    console.error("admin socialing-applications list error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "신청 목록을 불러오는데 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

