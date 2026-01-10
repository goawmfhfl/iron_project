import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getSocialingApplicationById,
  updateApplicationStatus,
} from "@/lib/services/socialing-apply-service";
import type { ApplicationStatus } from "@/lib/types/socialing-apply";

// 동적 렌더링 강제 (cookies 사용)
export const dynamic = 'force-dynamic';

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

    const application = await getSocialingApplicationById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("admin socialing-applications detail error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "신청 정보를 불러오는데 실패했습니다.",
      },
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
    const admin_note = body?.admin_note as string | null | undefined;

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태 값입니다." },
        { status: 400 }
      );
    }

    const application = await updateApplicationStatus(params.id, {
      status,
      admin_note,
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("admin socialing-applications update error:", error);
    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

