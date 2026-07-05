import { MemoTask } from '@/lib/supabase';

export const STATUS_OPTIONS = ['pending', 'in_progress', 'done'] as const;
export const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;
export const PRIORITY_WEIGHT: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function normalizeStatus(status: string | null) {
  return STATUS_OPTIONS.includes(status as (typeof STATUS_OPTIONS)[number]) ? String(status) : 'pending';
}

export function normalizePriority(priority: string | null) {
  return PRIORITY_OPTIONS.includes(priority as (typeof PRIORITY_OPTIONS)[number]) ? String(priority) : 'medium';
}

export function isDoneTask(task: MemoTask) {
  return normalizeStatus(task.status) === 'done';
}

export function getDeadlineTime(task: MemoTask) {
  if (!task.deadline) {
    return Number.POSITIVE_INFINITY;
  }

  const time = new Date(task.deadline).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function formatDeadline(value: string | null) {
  if (!value) {
    return 'Sin deadline';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin deadline';
  }

  return date.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
