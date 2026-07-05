import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase';
import type {
  ListeningModeResult,
  ListeningModeWebhookRequest,
  ListeningModeWebhookResponse,
  ListeningTask,
} from '@/types/memo';

const LISTENING_MODE_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_LISTENING_MODE_URL;
const RECORDING_BUCKET = 'recording';

export class ListeningModeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ListeningModeConfigurationError';
  }
}

function isWebhookFailure(success: ListeningModeWebhookResponse['success']) {
  return success === false || success === 'false';
}

function createRecordingFileName(meetingId: string) {
  return `${meetingId}.m4a`;
}

export async function createLiveMeeting(ownerId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      owner_id: ownerId,
      meeting_type: 'LIVE',
      status: 'active',
      date_time: new Date().toISOString(),
      title: 'Reunion en vivo',
    })
    .select('meeting_id')
    .single();

  if (error) {
    throw new Error(`No se pudo crear la reunion: ${error.message}`);
  }

  return data.meeting_id;
}

export async function updateMeetingAudioPath(meetingId: string, audioPath: string) {
  const { error } = await supabase
    .from('meetings')
    .update({ audio_path: audioPath })
    .eq('meeting_id', meetingId);

  if (error) {
    throw new Error(`No se pudo actualizar el audio de la reunion: ${error.message}`);
  }
}

export function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/El_Salvador';
  } catch {
    return 'America/El_Salvador';
  }
}

export function getCurrentDatetimeWithOffset(date = new Date()) {
  const offsetMinutes = date.getTimezoneOffset();
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
  const minutes = String(absoluteOffset % 60).padStart(2, '0');
  const sign = offsetMinutes <= 0 ? '+' : '-';

  const localDate = new Date(date.getTime() - offsetMinutes * 60_000);
  const isoLocal = localDate.toISOString().slice(0, 19);

  return `${isoLocal}${sign}${hours}:${minutes}`;
}

export async function uploadRecordingToStorage(
  localUri: string,
  profileId: string,
  meetingId: string
) {
  const fileName = createRecordingFileName(meetingId);
  const storagePath = `${profileId}/${fileName}`;
  const file = new File(localUri);
  const bytes = await file.bytes();

  const { error } = await supabase.storage.from(RECORDING_BUCKET).upload(storagePath, bytes, {
    contentType: 'audio/m4a',
    upsert: false,
  });

  if (error) {
    throw new Error(`No se pudo subir la grabacion: ${error.message}`);
  }

  const { data } = supabase.storage.from(RECORDING_BUCKET).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error('No se pudo obtener la URL publica de la grabacion.');
  }

  await updateMeetingAudioPath(meetingId, storagePath);

  return data.publicUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapWebhookPayload(raw: unknown): Record<string, unknown> {
  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      throw new Error('La respuesta del webhook llego vacia.');
    }

    return unwrapWebhookPayload(raw[0]);
  }

  if (!isRecord(raw)) {
    throw new Error('La respuesta del webhook no tiene el formato esperado.');
  }

  if (isWebhookFailure(raw.success as ListeningModeWebhookResponse['success'])) {
    throw new Error(
      typeof raw.message === 'string' && raw.message.trim()
        ? raw.message
        : 'No se pudo procesar la grabacion.'
    );
  }

  if (isRecord(raw.output)) {
    return raw.output;
  }

  if (isRecord(raw.json)) {
    return raw.json;
  }

  if (isRecord(raw.data)) {
    return raw.data;
  }

  return raw;
}

function normalizeTasks(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return Object.keys(value)
      .sort((left, right) => Number(left) - Number(right))
      .map((key) => value[key]);
  }

  return [];
}

function parseListeningModeResponse(raw: unknown): ListeningModeResult {
  const payload = unwrapWebhookPayload(raw);

  const meetingData = payload.meeting_data;
  const newTasks = normalizeTasks(payload.new_tasks);

  if (!isRecord(meetingData)) {
    throw new Error('La respuesta del webhook no incluye meeting_data o new_tasks.');
  }

  const selectedTool = payload.selected_tool;

  if (
    selectedTool !== 'tool_process_new_meeting' &&
    selectedTool !== 'tool_process_scheduled_meeting'
  ) {
    throw new Error('La respuesta del webhook no incluye un selected_tool valido.');
  }

  return {
    selected_tool: selectedTool,
    meeting_data: meetingData as ListeningModeResult['meeting_data'],
    new_tasks: newTasks as ListeningModeResult['new_tasks'],
  };
}

export async function sendListeningRecording(
  input: ListeningModeWebhookRequest
): Promise<ListeningModeResult> {
  if (!LISTENING_MODE_WEBHOOK_URL) {
    throw new ListeningModeConfigurationError(
      'Configura EXPO_PUBLIC_N8N_LISTENING_MODE_URL para procesar grabaciones.'
    );
  }

  const response = await fetch(LISTENING_MODE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const contentType = response.headers.get('content-type') ?? '';
  let raw: unknown;

  if (contentType.includes('application/json')) {
    raw = await response.json();
  } else {
    const text = await response.text();
    throw new Error(text || `El webhook respondio con estado ${response.status}.`);
  }

  if (!response.ok) {
    const message =
      raw && typeof raw === 'object' && !Array.isArray(raw) && 'message' in raw
        ? String((raw as { message?: unknown }).message ?? '')
        : '';

    throw new Error(message || `El webhook respondio con estado ${response.status}.`);
  }

  return parseListeningModeResponse(raw);
}

export async function persistListeningModeResult(
  result: ListeningModeResult,
  fallbackMeetingId: string,
  profileId: string
) {
  const { meeting_data: meetingData, new_tasks: newTasks } = result;
  const meetingId = meetingData.meeting_id ?? fallbackMeetingId;

  const meetingUpdate: {
    title: string;
    ai_summary: string;
    transcription: string;
    status: string;
    date_time?: string;
  } = {
    title: meetingData.title,
    ai_summary: meetingData.ai_summary,
    transcription: meetingData.transcription,
    status: 'completed',
  };

  if (meetingData.date_time) {
    meetingUpdate.date_time = meetingData.date_time;
  }

  const { error: meetingError } = await supabase
    .from('meetings')
    .update(meetingUpdate)
    .eq('meeting_id', meetingId);

  if (meetingError) {
    throw new Error(`No se pudo guardar la reunion: ${meetingError.message}`);
  }

  if (newTasks.length === 0) {
    return;
  }

  const taskRows = newTasks.map((task: ListeningTask) => ({
    profile_id: profileId,
    meeting_id: meetingId,
    title: task.title,
    description: task.description,
    priority_level: task.priority_level,
    status: task.status,
    deadline: task.deadline,
  }));

  const { error: tasksError } = await supabase.from('tasks').insert(taskRows);

  if (tasksError) {
    throw new Error(`No se pudieron guardar las tareas: ${tasksError.message}`);
  }
}
