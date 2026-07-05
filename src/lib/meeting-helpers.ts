import { MemoMeeting } from '@/lib/supabase';

function getMeetingDate(meeting: MemoMeeting) {
  if (!meeting.date_time) {
    return null;
  }

  const date = new Date(meeting.date_time);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isPastMeeting(meeting: MemoMeeting) {
  const date = getMeetingDate(meeting);
  return Boolean(date && date.getTime() < Date.now());
}

export function formatMeetingDate(value: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleString('es', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
