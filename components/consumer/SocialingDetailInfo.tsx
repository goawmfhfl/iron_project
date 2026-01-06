"use client";

import { Card, CardContent } from "@/components/ui/Card";
import type { Socialing } from "@/lib/types/socialing";
import { formatEventDate } from "@/lib/utils/date";

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M20.59 13.41L12 22l-8-8V2h12l4.59 11.41z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </Icon>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 1v22" />
      <path d="M17 5H10a4 4 0 0 0 0 8h4a4 4 0 0 1 0 8H7" />
    </Icon>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

interface SocialingDetailInfoProps {
  socialing: Socialing;
}

export function SocialingDetailInfo({ socialing }: SocialingDetailInfoProps) {
  const formattedEventDate = socialing.eventDate
    ? formatEventDate(socialing.eventDate)
    : "날짜 미정";

  const formattedParticipationFee =
    socialing.participationFee === null || socialing.participationFee === 0
      ? "무료"
      : `${socialing.participationFee.toLocaleString()}원`;

  return (
    <Card elevation={1} className="mb-8">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <TagIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-bold text-text-primary">
            {socialing.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-text-secondary">
          <CalendarIcon className="w-6 h-6 text-primary-500" />
          <p className="text-base">{formattedEventDate}</p>
        </div>

        <div className="flex items-center gap-3 text-text-secondary">
          <CurrencyIcon className="w-6 h-6 text-primary-500" />
          <p className="text-base">{formattedParticipationFee}</p>
        </div>

        {socialing.location && (
          <div className="flex items-center gap-3 text-text-secondary">
            <MapPinIcon className="w-6 h-6 text-primary-500" />
            <p className="text-base">{socialing.location}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

