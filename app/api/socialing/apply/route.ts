import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSocialingApplication } from "@/lib/services/socialing-apply-service";
import { getSocialingByPageId } from "@/lib/services/notion-service.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { socialing_id, question_answer } = body || {};

    // 필수 필드 검증
    if (!socialing_id) {
      return NextResponse.json(
        { error: "socialing_id는 필수입니다." },
        { status: 400 }
      );
    }

    if (!question_answer || typeof question_answer !== "string" || question_answer.trim().length < 5) {
      return NextResponse.json(
        { error: "질문 답변은 최소 5글자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 로그인 유저 정보 가져오기 (필수)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다. 회원만 신청할 수 있습니다." },
        { status: 401 }
      );
    }

    // 인증된 사용자 정보 필수 필드로 설정
    const user_id = user.id;
    const user_email = user.email;
    if (!user_email) {
      return NextResponse.json(
        { error: "사용자 이메일 정보가 없습니다." },
        { status: 400 }
      );
    }

    const user_name =
      (user.user_metadata?.nickname as string) ||
      (user.user_metadata?.user_name as string) ||
      (user.user_metadata?.name as string) ||
      null;

    // 소셜링 제목 가져오기 (스냅샷)
    let socialing_title: string | null = null;
    try {
      const socialing = await getSocialingByPageId(socialing_id);
      if (socialing) {
        socialing_title = socialing.title;
      }
    } catch (error) {
      console.error("소셜링 제목 조회 실패:", error);
      // 소셜링 제목 조회 실패는 치명적이지 않으므로 계속 진행
    }

    // 신청 생성
    const application = await createSocialingApplication({
      socialing_id,
      socialing_title,
      user_id,
      user_email,
      user_name,
      question_answer: question_answer.trim(),
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("apply api error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "신청 제출에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

