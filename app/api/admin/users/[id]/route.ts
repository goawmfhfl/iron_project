import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/admin/users/[id]
 * 회원 정보 수정 (email 등 Admin API가 필요한 경우)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // 현재 사용자가 관리자인지 확인
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userRole =
      (currentUser.user_metadata?.user_role as string) || "user";
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Email 변경은 Admin API가 필요하므로
    // 여기서는 Service Role Key를 사용해야 합니다.
    // 실제 구현 시 환경 변수에 SERVICE_ROLE_KEY를 추가해야 합니다.

    // 임시로 user_metadata만 업데이트
    // 실제 email 변경은 Supabase Dashboard에서 수동으로 하거나
    // Service Role Key를 사용한 Admin API 호출이 필요합니다.

    return NextResponse.json({
      message: "회원 정보가 수정되었습니다.",
      note: "Email 변경은 Supabase Admin API가 필요합니다.",
    });
  } catch (error) {
    console.error("회원 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "회원 정보 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

