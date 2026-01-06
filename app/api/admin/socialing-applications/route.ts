import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FormDatabaseType } from "@/lib/types/notion-form";
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

    const formDatabaseType = (searchParams.get("form_database_type") ||
      "") as FormDatabaseType | "";
    const status = (searchParams.get("status") || "") as ApplicationStatus | "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    let query = supabase
      .from("socialing_applications")
      .select("*", { count: "exact" });

    if (formDatabaseType) {
      query = query.eq("form_database_type", formDatabaseType);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);
    if (error) {
      return NextResponse.json(
        { error: `신청 목록 조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data ?? [],
      total: count ?? 0,
    });
  } catch (error) {
    console.error("admin socialing-applications list error:", error);
    return NextResponse.json(
      { error: "신청 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

