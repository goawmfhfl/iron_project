export type NotionFormFieldType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "files";

export interface NotionFormField {
  id: string;
  name: string;
  type: NotionFormFieldType;
  required?: boolean;
  options?: string[]; // select, multi_select용
  isLongText?: boolean; // rich_text일 때 textarea 여부
  maxSelections?: number; // multi_select 최대 선택
  order?: number; // "01. ..." prefix 기반 정렬용
  description?: string; // 필드 설명 (Notion property.description)
  placeholder?: string; // placeholder 텍스트
  isDescription?: boolean; // 설명 필드 여부
  isDetail?: boolean; // 상세 답변 필드 여부
  validation?: { min?: number; max?: number; pattern?: string }; // 검증 규칙
}

export interface NotionFormSchema {
  databaseId: string;
  fields: NotionFormField[];
  submitUrl: string;
  coverImage?: string | null; // 폼 썸네일
}

export type FormDatabaseType = "DORAN_BOOK" | "EVENT" | "VIVID";

