import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { type EdgeInsets } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { MemoMeetingSummary } from '@/components/memo-meeting-summary';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import {
  createLiveMeeting,
  getCurrentDatetimeWithOffset,
  getDeviceTimezone,
  persistListeningModeResult,
  sendListeningRecording,
  uploadRecordingToStorage,
} from '@/services/listening-mode';
import type { ListeningModeResult } from '@/types/memo';

type ListenPhase =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'uploading'
  | 'processing'
  | 'result'
  | 'error';

export type MemoListenSheetProps = {
  insets: EdgeInsets;
  onDismiss: () => void;
};

function formatRecordingDuration(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MemoListenSheet({ insets, onDismiss }: MemoListenSheetProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<ListenPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ListeningModeResult | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);

  const pulse = useSharedValue(0);

  useEffect(() => {
    if (phase !== 'recording') {
      cancelAnimation(pulse);
      pulse.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [phase, pulse]);

  const haloAnimatedStyle = useAnimatedStyle(() => {
    const wave = pulse.value - 0.5;

    return {
      shadowOpacity: 0.38 + pulse.value * 0.28,
      shadowRadius: 48 + pulse.value * 18,
      transform: [{ scale: 1 + wave * 0.08 }],
    };
  });

  const resetFlow = useCallback(() => {
    setPhase('idle');
    setErrorMessage(null);
    setResult(null);
    setMeetingId(null);
    setAudioUrl(null);
  }, []);

  const processRecording = useCallback(
    async (localUri: string, activeMeetingId: string) => {
      const profileId = profile?.profile_id;

      if (!profileId) {
        throw new Error('No se encontro tu perfil para procesar la grabacion.');
      }

      setPhase('uploading');

      const recordingUrl = await uploadRecordingToStorage(localUri, profileId, activeMeetingId);
      setAudioUrl(recordingUrl);

      setPhase('processing');

      const listeningResult = await sendListeningRecording({
        profile_id: profileId,
        recording_url: recordingUrl,
        meeting_id: activeMeetingId,
        timezone: getDeviceTimezone(),
        current_datetime: getCurrentDatetimeWithOffset(),
      });

      await persistListeningModeResult(listeningResult, activeMeetingId, profileId);

      setResult(listeningResult);
      setPhase('result');
    },
    [profile?.profile_id]
  );

  const handleStartRecording = useCallback(async () => {
    const profileId = profile?.profile_id;

    if (!profileId) {
      setErrorMessage('No se encontro tu perfil para iniciar la grabacion.');
      setPhase('error');
      return;
    }

    setErrorMessage(null);
    setPhase('preparing');

    try {
      const { granted } = await requestRecordingPermissionsAsync();

      if (!granted) {
        setErrorMessage('Necesitamos permiso de microfono para grabar la reunion.');
        setPhase('error');
        return;
      }

      const createdMeetingId = await createLiveMeeting(profileId);
      setMeetingId(createdMeetingId);

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setPhase('recording');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar la grabacion.';
      setErrorMessage(message);
      setPhase('error');
    }
  }, [audioRecorder, profile?.profile_id]);

  const handleStopRecording = useCallback(async () => {
    if (!meetingId) {
      setErrorMessage('No se encontro la reunion asociada a esta grabacion.');
      setPhase('error');
      return;
    }

    try {
      await audioRecorder.stop();

      const localUri = audioRecorder.uri;

      if (!localUri) {
        throw new Error('No se pudo obtener el archivo de audio grabado.');
      }

      await processRecording(localUri, meetingId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo procesar la grabacion.';
      setErrorMessage(message);
      setPhase('error');
    }
  }, [audioRecorder, meetingId, processRecording]);

  useEffect(() => {
    return () => {
      if (recorderState.isRecording) {
        audioRecorder.stop().catch(() => undefined);
      }
    };
  }, [audioRecorder, recorderState.isRecording]);

  const statusCopy = useMemo(() => {
    switch (phase) {
      case 'preparing':
        return {
          eyebrow: 'Reunion en vivo',
          title: 'Preparando',
          description: 'Creando la reunion y configurando el microfono',
        };
      case 'recording':
        return {
          eyebrow: 'Reunion en vivo',
          title: 'Grabando',
          description: formatRecordingDuration(recorderState.durationMillis),
        };
      case 'uploading':
        return {
          eyebrow: 'Procesando',
          title: 'Subiendo audio',
          description: 'Guardando la grabacion en la nube',
        };
      case 'processing':
        return {
          eyebrow: 'Procesando',
          title: 'Analizando reunion',
          description: 'Memo esta transcribiendo, resumiendo y guardando',
        };
      case 'error':
        return {
          eyebrow: 'Reunion en vivo',
          title: 'Algo salio mal',
          description: errorMessage ?? 'No se pudo completar el flujo de escucha.',
        };
      default:
        return {
          eyebrow: 'Reunion en vivo',
          title: 'Modo escucha',
          description: 'Graba la reunion y Memo generara el resumen al finalizar.',
        };
    }
  }, [errorMessage, phase, recorderState.durationMillis]);

  if (phase === 'result' && result) {
    return (
      <View
        style={[
          styles.listenResultContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.four) },
        ]}>
        <MemoMeetingSummary result={result} audioUrl={audioUrl} onDone={onDismiss} />
      </View>
    );
  }

  const isBusy = phase === 'preparing' || phase === 'uploading' || phase === 'processing';

  return (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
      <View style={styles.memoStage}>
        <Animated.View
          style={[
            styles.memoHalo,
            phase === 'recording' && styles.memoHaloRecording,
            phase === 'recording' ? haloAnimatedStyle : undefined,
          ]}>
          <Image
            source={require('@/assets/MemoIcon1080px.png')}
            style={styles.memoIcon}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>{statusCopy.eyebrow}</Text>
        <Text style={styles.title}>{statusCopy.title}</Text>
        <Text style={styles.description}>{statusCopy.description}</Text>
      </View>

      {phase === 'idle' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Iniciar grabacion"
          disabled={isBusy}
          onPress={handleStartRecording}
          style={({ pressed }) => [styles.recordButton, pressed && styles.recordButtonPressed]}>
          <Text style={styles.recordButtonText}>Iniciar grabacion</Text>
        </Pressable>
      ) : null}

      {phase === 'recording' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Detener grabacion"
          onPress={handleStopRecording}
          style={({ pressed }) => [styles.stopButton, pressed && styles.recordButtonPressed]}>
          <SymbolView name="stop.fill" tintColor={MemoColors.white} size={22} />
          <Text style={styles.stopButtonText}>Detener</Text>
        </Pressable>
      ) : null}

      {isBusy ? (
        <View style={styles.processingRow}>
          <ActivityIndicator color={MemoColors.white} />
          <Text style={styles.processingText}>Esto puede tardar unos segundos...</Text>
        </View>
      ) : null}

      {phase === 'error' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          onPress={resetFlow}
          style={({ pressed }) => [styles.recordButton, pressed && styles.recordButtonPressed]}>
          <Text style={styles.recordButtonText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  memoStage: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoHalo: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(35,133,255,0.18)',
    shadowColor: MemoColors.secondaryBlue,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.42,
    shadowRadius: 48,
  },
  memoHaloRecording: {
    borderColor: 'rgba(248,113,113,0.5)',
    backgroundColor: 'rgba(248,113,113,0.14)',
    shadowColor: '#F87171',
  },
  memoIcon: {
    width: 142,
    height: 142,
  },
  copyBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: MemoColors.white,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: MemoColors.white,
    paddingHorizontal: Spacing.four,
  },
  recordButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  recordButtonText: {
    color: '#03122A',
    fontSize: 17,
    fontWeight: '800',
  },
  stopButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 28,
    backgroundColor: '#E11D48',
    paddingHorizontal: Spacing.four,
  },
  stopButtonText: {
    color: MemoColors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  processingRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  processingText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  listenResultContent: {
    flex: 1,
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
