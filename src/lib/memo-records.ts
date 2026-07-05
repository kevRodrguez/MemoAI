import { MemoMeeting, MemoTask, supabase } from '@/lib/supabase';

type TaskUpdate = {
  title: string;
  description: string;
  priority_level: string;
  status: string;
  deadline: string | null;
};

type MeetingUpdate = {
  title: string;
  date_time: string | null;
  duration: number | null;
  transcription?: string | null;
  ai_summary?: string | null;
};

export async function fetchTasks(profileId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('task_id, profile_id, meeting_id, title, description, priority_level, status, deadline')
    .eq('profile_id', profileId)
    .order('deadline', { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as MemoTask[];
}

export async function updateTask(taskId: string, values: TaskUpdate) {
  const { data, error } = await supabase
    .from('tasks')
    .update(values)
    .eq('task_id', taskId)
    .select('task_id, profile_id, meeting_id, title, description, priority_level, status, deadline')
    .single();

  if (error) {
    throw error;
  }

  return data as MemoTask;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('task_id', taskId);

  if (error) {
    throw error;
  }
}

export async function fetchTaskById(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('task_id, profile_id, meeting_id, title, description, priority_level, status, deadline')
    .eq('task_id', taskId)
    .single();

  if (error) {
    throw error;
  }

  return data as MemoTask;
}

export async function fetchMeetings(profileId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select(
      'meeting_id, owner_id, title, date_time, duration, audio_path, transcription, ai_summary, status, meeting_type'
    )
    .eq('owner_id', profileId)
    .order('date_time', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as MemoMeeting[];
}

export async function updateMeeting(meetingId: string, values: MeetingUpdate) {
  const { data, error } = await supabase
    .from('meetings')
    .update(values)
    .eq('meeting_id', meetingId)
    .select('meeting_id, owner_id, title, date_time, duration, audio_path, transcription, ai_summary, status, meeting_type')
    .single();

  if (error) {
    throw error;
  }

  return data as MemoMeeting;
}

export async function deleteMeeting(meetingId: string) {
  const { error } = await supabase.from('meetings').delete().eq('meeting_id', meetingId);

  if (error) {
    throw error;
  }
}

export async function fetchMeetingById(meetingId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select(
      'meeting_id, owner_id, title, date_time, duration, audio_path, transcription, ai_summary, status, meeting_type'
    )
    .eq('meeting_id', meetingId)
    .single();

  if (error) {
    throw error;
  }

  return data as MemoMeeting;
}
