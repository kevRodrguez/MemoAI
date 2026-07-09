import { supabase } from '@/lib/supabase';

const RECORDING_BUCKET = 'recording';

export function getRecordingPublicUrl(audioPath: string | null | undefined) {
  if (!audioPath?.trim()) {
    return null;
  }

  const { data } = supabase.storage.from(RECORDING_BUCKET).getPublicUrl(audioPath.trim());

  return data.publicUrl ?? null;
}
