export type MemoMode = 'call' | 'listen' | null;

export type MemoStatus = 'off' | 'listening' | 'thinking' | 'speaking';

export type MemoChatWebhookRequest = {
  message: string;
  userId: string | null;
  profileId: string | null;
  userEmail: string | null;
  sentAt: string;
  source: 'memo-home';
};

export type MemoChatWebhookResponse = {
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
