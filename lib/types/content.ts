export type ContentStatus = "종료" | "대기" | "오픈";

export interface ReadMargnet {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  notion_url: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateReadMargnetInput {
  title: string;
  description: string;
  thumbnail_url?: string | null;
  notion_url: string;
  status?: ContentStatus;
}

export interface UpdateReadMargnetInput {
  title?: string;
  description?: string;
  thumbnail_url?: string | null;
  notion_url?: string;
  status?: ContentStatus;
}

