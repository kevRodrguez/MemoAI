import type { MemoTask } from '@/lib/supabase';
import type { ListeningTask, ListeningTaskPriority } from '@/types/memo';

function isTaskPriority(value: string | null): value is ListeningTaskPriority {
  return value === 'baja' || value === 'media' || value === 'alta';
}

export function mapMemoTaskToSummaryTask(task: MemoTask): ListeningTask {
  return {
    id: task.task_id,
    title: task.title ?? 'Tarea sin titulo',
    description: task.description ?? '',
    priority_level: isTaskPriority(task.priority_level) ? task.priority_level : 'media',
    status: task.status ?? 'pendiente',
    deadline: task.deadline,
  };
}
