import type {
  MemoChatWebhookRequest,
  MemoChatWebhookResponse,
  MemoTranscriptWebhookRequest,
} from '@/types/memo';

const CHAT_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_CHAT;
const TRANSCRIPT_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_TRANSCRIPT_WEBHOOK_URL;

export class MemoWebhookConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoWebhookConfigurationError';
  }
}

function isWebhookFailure(success: MemoChatWebhookResponse['success']) {
  return success === false || success === 'false';
}

async function parseWebhookResponse(response: Response): Promise<MemoChatWebhookResponse> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const raw = await response.json();

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const parsed = { ...(raw as MemoChatWebhookResponse), raw };

      if (isWebhookFailure(parsed.success)) {
        throw new Error(
          typeof parsed.message === 'string' && parsed.message.trim()
            ? parsed.message
            : 'No se pudo obtener una respuesta de Memo.'
        );
      }

      return parsed;
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

export function getReplyFromWebhook(response: MemoChatWebhookResponse) {
  return response.response ?? response.reply ?? response.message ?? response.text ?? null;
}

export async function sendMemoChatMessage(
  input: MemoChatWebhookRequest
): Promise<MemoChatWebhookResponse> {
  if (!CHAT_WEBHOOK_URL) {
    throw new MemoWebhookConfigurationError(
      'Configura EXPO_PUBLIC_N8N_CHAT para enviar mensajes a Memo.'
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
