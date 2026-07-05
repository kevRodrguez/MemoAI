import { PermissionsAndroid, Platform } from 'react-native';

const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;

export class ElevenLabsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElevenLabsConfigurationError';
  }
}

export function getAgentId(): string {
  if (!AGENT_ID) {
    throw new ElevenLabsConfigurationError(
      'Configura EXPO_PUBLIC_ELEVENLABS_AGENT_ID para iniciar la llamada con Memo.'
    );
  }

  return AGENT_ID;
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Permiso de microfono',
        message: 'Memo necesita el microfono para conversar contigo por voz.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Cancelar',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}
