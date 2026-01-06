export type SocialingStatus = "OPEN" | "PENDING" | "FINISH" | "STAGING";
export type SocialingType = "CHALLENGE" | "SOCIALING" | "EVENT";

export interface EventDate {
  start: string | null;
  end: string | null;
  hasStartTime: boolean;
  hasEndTime: boolean;
}

export interface SocialingThumbnail {
  pageId: string;
  order: number;
  status: SocialingStatus;
  url: string | null;
  coverImage: string | null;
}

export interface Socialing {
  pageId: string;
  title: string;
  description: string | null;
  status: SocialingStatus;
  type: SocialingType;
  eventDate: EventDate | null;
  participationFee: number | null;
  location: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}
