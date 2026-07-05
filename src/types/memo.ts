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
