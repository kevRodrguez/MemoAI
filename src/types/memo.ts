export type MemoMode = 'call' | 'listen' | null;

export type MemoStatus = 'off' | 'listening' | 'thinking' | 'speaking';

export type MemoPersonality = 'executive' | 'technical' | 'casual' | 'teammate';

export type MemoChatMessage = {
  id: string;
  role: 'user' | 'memo';
  text: string;
  createdAt: string;
};

export type MemoChatWebhookRequest = {
  message: string;
  profile_id: string;
  personality: MemoPersonality;
};

export type MemoChatWebhookResponse = {
  success?: boolean | string;
  response?: string;
  reply?: string;
  message?: string;
  text?: string;
  raw?: unknown;
};

export type MemoTranscriptWebhookRequest = {
  transcript: string;
  meetingType: 'LIVE';
  userId: string | null;
  profileId: string | null;
  endedAt: string;
};

export type ListeningTaskPriority = 'baja' | 'media' | 'alta';

export type ListeningMeetingData = {
  meeting_id: string | null;
  owner_id: string;
  title: string;
  ai_summary: string;
  transcription: string;
  date_time: string | null;
};

export type ListeningTask = {
  id: string | null;
  title: string;
  description: string;
  priority_level: ListeningTaskPriority;
  status: string;
  deadline: string | null;
};

export type ListeningModeResult = {
  selected_tool: 'tool_process_new_meeting' | 'tool_process_scheduled_meeting';
  meeting_data: ListeningMeetingData;
  new_tasks: ListeningTask[];
};

export type ListeningModeWebhookRequest = {
  profile_id: string;
  recording_url: string;
  meeting_id: string;
  timezone: string;
  current_datetime: string;
};

export type ListeningModeWebhookResponse = ListeningModeResult & {
  success?: boolean | string;
  message?: string;
  statusCode?: string;
};
