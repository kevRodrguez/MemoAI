import type {
  MemoChatWebhookRequest,
  MemoChatWebhookResponse,
  MemoTranscriptWebhookRequest,
} from '@/types/alma';

const CHAT_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_CHAT_WEBHOOK_URL;
const TRANSCRIPT_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_TRANSCRIPT_WEBHOOK_URL;

export class MemoWebhookConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoWebhookConfigurationError';
  }
}

async function parseWebhookResponse(response: Response): Promise<MemoChatWebhookResponse> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const raw = await response.json();

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return { ...(raw as MemoChatWebhookResponse), raw };
    }

    return { raw };
  }

  const text = await response.text();
  return text ? { text, raw: text } : {};
}

function assertOkResponse(response: Response, action: string) {
  if (!response.ok) {
    throw new Error(`${action} respondio con estado ${response.status}.`);
  }
}

export async function sendMemoChatMessage(
  input: MemoChatWebhookRequest
): Promise<MemoChatWebhookResponse> {
  if (!CHAT_WEBHOOK_URL) {
    throw new MemoWebhookConfigurationError(
      'Configura EXPO_PUBLIC_N8N_CHAT_WEBHOOK_URL para enviar mensajes a Memo.'
    );
  }

  const response = await fetch(CHAT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  assertOkResponse(response, 'El webhook de chat');
  return parseWebhookResponse(response);
}

export async function sendMemoTranscriptToProcessing(
  input: MemoTranscriptWebhookRequest
): Promise<void> {
  if (!TRANSCRIPT_WEBHOOK_URL) {
    throw new MemoWebhookConfigurationError(
      'Configura EXPO_PUBLIC_N8N_TRANSCRIPT_WEBHOOK_URL para procesar transcripciones.'
    );
  }

  const response = await fetch(TRANSCRIPT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  assertOkResponse(response, 'El webhook de procesamiento');
}
