"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      
      // "Lock broken by another request" 오류는 무시하고 재시도
      if (userError && userError.message.includes("Lock broken by another request")) {
        // 짧은 지연 후 재시도
        await new Promise((resolve) => setTimeout(resolve, 100));
        const {
          data: { user: retryUser },
        } = await supabase.auth.getUser();
        setUser(retryUser ?? null);
      } else {
        setUser(currentUser ?? null);
      }
    } catch (error) {
      // 예상치 못한 오류는 로깅만 하고 사용자 상태는 유지
      if (
        error instanceof Error &&
        error.message.includes("Lock broken by another request")
      ) {
        // 락 충돌 오류는 무시하고 기존 사용자 상태 유지
      } else {
        console.warn("Auth refresh error:", error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 사용자 로드
    refresh();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refresh();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

