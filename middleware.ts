import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수 미설정 시에는 세션 갱신을 스킵
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 세션을 읽는 순간, 만료 임박 토큰이면 쿠키가 갱신됩니다.
  // 동시 요청으로 인한 락 충돌 오류는 무시합니다.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // "Lock broken by another request" 오류는 무시
    // 이는 다른 요청이 이미 세션을 갱신했음을 의미합니다.
    if (
      error instanceof Error &&
      error.message.includes("Lock broken by another request")
    ) {
      // 정상적인 상황이므로 무시
    } else {
      // 다른 오류는 로깅만 하고 계속 진행
      console.warn("Middleware auth error:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

