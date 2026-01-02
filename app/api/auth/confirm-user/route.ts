import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/confirm-user
 * 회원가입 후 이메일 확인 처리 (Service Role Key 사용)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Service Role Key를 사용하여 Admin API 호출
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        {
          error: "서버 설정이 올바르지 않습니다.",
          note: "SUPABASE_SERVICE_ROLE_KEY와 NEXT_PUBLIC_SUPABASE_URL 환경 변수가 필요합니다.",
        },
        { status: 500 }
      );
    }

    // Admin 클라이언트 생성 (Service Role Key 사용)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 사용자 이메일 확인 처리
    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
      }
    );

    if (error) {
      console.error("이메일 확인 처리 실패:", error);
      return NextResponse.json(
        { 
          error: `이메일 확인 처리 실패: ${error.message}`,
          code: error.status || "unknown_error"
        },
        { status: 500 }
      );
    }

    if (!data || !data.user) {
      return NextResponse.json(
        { error: "사용자 정보를 가져올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "이메일 확인이 완료되었습니다.",
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("이메일 확인 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: "이메일 확인 처리 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

