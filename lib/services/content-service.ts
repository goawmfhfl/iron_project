"use client";

import { supabase } from "@/lib/supabase/client";
import type {
  ReadMargnet,
  CreateReadMargnetInput,
  UpdateReadMargnetInput,
  ContentStatus,
} from "@/lib/types/content";

/**
 * 모든 컨텐츠 조회
 */
export async function getAllContents(): Promise<ReadMargnet[]> {
  const { data, error } = await supabase
    .from("read_margnet")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`컨텐츠 조회 실패: ${error.message}`);
  }

  return (data || []) as ReadMargnet[];
}

/**
 * 컨텐츠 ID로 조회
 */
export async function getContentById(id: string): Promise<ReadMargnet | null> {
  const { data, error } = await supabase
    .from("read_margnet")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`컨텐츠 조회 실패: ${error.message}`);
  }

  return data as ReadMargnet;
}

/**
 * 컨텐츠 생성
 */
export async function createContent(
  input: CreateReadMargnetInput
): Promise<ReadMargnet> {
  // 현재 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("read_margnet")
    .insert({
      ...input,
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`컨텐츠 생성 실패: ${error.message}`);
  }

  return data as ReadMargnet;
}

/**
 * 컨텐츠 수정
 */
export async function updateContent(
  id: string,
  input: UpdateReadMargnetInput
): Promise<ReadMargnet> {
  const { data, error } = await supabase
    .from("read_margnet")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`컨텐츠 수정 실패: ${error.message}`);
  }

  return data as ReadMargnet;
}

/**
 * 컨텐츠 삭제
 */
export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from("read_margnet").delete().eq("id", id);

  if (error) {
    throw new Error(`컨텐츠 삭제 실패: ${error.message}`);
  }
}

/**
 * 컨텐츠 상태 업데이트
 */
export async function updateContentStatus(
  id: string,
  status: ContentStatus
): Promise<ReadMargnet> {
  const { data, error } = await supabase
    .from("read_margnet")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`컨텐츠 상태 업데이트 실패: ${error.message}`);
  }

  return data as ReadMargnet;
}

