import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
  );
}

// NOTE:
// - @supabase/ssr의 브라우저 클라이언트는 인증 세션을 쿠키로 관리합니다.
// - 서버(API Route / Server Component)에서도 동일한 세션을 읽을 수 있어 SSR 환경에서 일관됩니다.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

