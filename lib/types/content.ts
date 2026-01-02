export interface CTAButton {
  id: string;
  title: string;
  description: string;
  image_url: string;
  url: string;
}

export type ContentStatus = "종료" | "대기" | "오픈";

export interface ReadMargnet {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  notion_url: string;
  cta_buttons: CTAButton[];
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
  cta_buttons: CTAButton[];
  status?: ContentStatus;
}

export interface UpdateReadMargnetInput {
  title?: string;
  description?: string;
  thumbnail_url?: string | null;
  notion_url?: string;
  cta_buttons?: CTAButton[];
  status?: ContentStatus;
}

