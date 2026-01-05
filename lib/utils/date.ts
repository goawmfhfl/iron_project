import type { EventDate } from "@/lib/types/socialing";

/**
 * 요일 이름 배열 (일요일부터)
 */
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜 문자열에서 Date 객체 생성
 */
function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 날짜가 시간을 포함하는지 확인 (ISO 문자열에 'T'가 있고 시간 부분이 있는지)
 */
function hasTime(dateString: string): boolean {
  return dateString.includes("T") && dateString.split("T")[1]?.length > 0;
}

/**
 * 시간 포맷팅 (오전/오후 형식)
 */
function formatTime(dateString: string): string {
  const date = parseDate(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const period = hours >= 12 ? "오후" : "오전";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, "0");
  
  return `${period} ${displayHours}:${displayMinutes}`;
}

/**
 * 날짜 포맷팅 (년.월.일(요일) 형식)
 */
function formatDate(dateString: string): string {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  
  return `${year}.${month}.${day}(${dayName})`;
}

/**
 * 이벤트 날짜를 한국어 형식으로 포맷팅
 * - 시작일만 있으면: "2026.1.11(일)"
 * - 시작일+시간: "2026.1.11(일) 오후 3:10"
 * - 종료일도 있으면: "2026.1.11(일) 오후 3:10 ~ 2026.1.12(월) 오후 5:00"
 */
export function formatEventDate(eventDate: EventDate | null): string {
  if (!eventDate || !eventDate.start) {
    return "";
  }

  const startDateStr = formatDate(eventDate.start);
  const startTimeStr = eventDate.hasStartTime
    ? ` ${formatTime(eventDate.start)}`
    : "";

  if (!eventDate.end) {
    return `${startDateStr}${startTimeStr}`;
  }

  const endDateStr = formatDate(eventDate.end);
  const endTimeStr = eventDate.hasEndTime
    ? ` ${formatTime(eventDate.end)}`
    : "";

  return `${startDateStr}${startTimeStr} ~ ${endDateStr}${endTimeStr}`;
}
