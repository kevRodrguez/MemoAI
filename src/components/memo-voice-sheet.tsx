import { BottomSheet, RNHostView } from '@expo/ui';
import { padding, presentationBackground } from '@expo/ui/swift-ui/modifiers';
import { useConversation, type ConversationStatus } from '@elevenlabs/react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { ensureMicrophonePermission, getAgentId } from '@/services/elevenlabs';
import type { MemoMode } from '@/types/memo';

const SHEET_BASE_COLOR = '#020617';

const SHEET_MODIFIERS = [
  padding({ top: -16, leading: -16, trailing: -16 }),
  presentationBackground(SHEET_BASE_COLOR),
];

type ActiveMemoMode = Exclude<MemoMode, null>;

type MemoVoiceSheetProps = {
  mode: ActiveMemoMode | null;
  onDismiss: () => void;
};

export function MemoVoiceSheet({ mode, onDismiss }: MemoVoiceSheetProps) {
  const insets = useSafeAreaInsets();

  if (!mode) {
    return null;
  }

  return (
    <BottomSheet
      isPresented
      onDismiss={onDismiss}
      showDragIndicator
      snapPoints={['full']}
      modifiers={SHEET_MODIFIERS}
      testID="memo-voice-sheet">
      <RNHostView>
        <View style={styles.sheet}>
          <LinearGradient
            colors={['#030712', '#071A3A', '#020617']}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {mode === 'call' ? (
            <CallSheetBody insets={insets} onDismiss={onDismiss} />
          ) : (
            <ListenSheetBody insets={insets} />
          )}
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

type CallSheetBodyProps = {
  insets: EdgeInsets;
  onDismiss: () => void;
};

function CallSheetBody({ insets, onDismiss }: CallSheetBodyProps) {
  const { profile } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { status, isSpeaking, isMuted, setMuted, startSession, endSession } = useConversation({
    onConnect: (details) => {
      console.log('[memo-call] onConnect', details);
    },
    onDisconnect: (details) => {
      console.log('[memo-call] onDisconnect', details);
    },
    onStatusChange: (next) => {
      console.log('[memo-call] onStatusChange', next);
    },
    onModeChange: (next) => {
      console.log('[memo-call] onModeChange', next);
    },
    onError: (message, context) => {
      console.log('[memo-call] onError', message, context);
      setErrorMessage(typeof message === 'string' ? message : 'Ocurrio un error en la llamada.');
    },
  });

  const enter = useSharedValue(0);
  const pulse = useSharedValue(0);
  const speaking = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;

    enter.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) });

    (async () => {
      try {
        const granted = await ensureMicrophonePermission();

        if (!granted) {
          setErrorMessage('Necesitamos permiso de microfono para iniciar la llamada.');
          return;
        }

        if (cancelled) {
          return;
        }

        startSession({
          agentId: getAgentId(),
          dynamicVariables: {
            profile_id: profile?.profile_id ?? '',
            name: profile?.name ?? '',
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo iniciar la llamada.';
        setErrorMessage(message);
      }
    })();

    return () => {
      cancelled = true;
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    speaking.value = withTiming(isSpeaking ? 1 : 0, { duration: 260 });

    cancelAnimation(pulse);
    pulse.value = withRepeat(
      withTiming(1, {
        duration: isSpeaking ? 560 : 2400,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [isSpeaking, pulse, speaking]);

  const haloAnimatedStyle = useAnimatedStyle(() => {
    const baseScale = interpolate(enter.value, [0, 1], [0.82, 1]);
    const wave = pulse.value - 0.5;

    const idleBreath = 1 + pulse.value * 0.03;
    const liveScale = 1 + wave * 0.2 * speaking.value;
    const bob = wave * 22 * speaking.value;

    return {
      opacity: interpolate(enter.value, [0, 0.4, 1], [0, 1, 1]),
      shadowOpacity: 0.42 + speaking.value * 0.3,
      shadowRadius: 48 + speaking.value * 26,
      transform: [{ translateY: bob }, { scale: baseScale * idleBreath * liveScale }],
    };
  });

  const statusText = useMemo(() => {
    if (errorMessage) {
      return 'Llamada no disponible';
    }

    switch (status) {
      case 'connecting':
        return 'Conectando';
      case 'connected':
        return isSpeaking ? 'Memo esta hablando' : 'Escuchando';
      case 'error':
        return 'Error de conexion';
      default:
        return 'Llamada finalizada';
    }
  }, [errorMessage, isSpeaking, status]);

  const statusDescription = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    switch (status) {
      case 'connecting':
        return 'Preparando la conexion de voz';
      case 'connected':
        return 'Llamada en curso';
      default:
        return 'La llamada ha terminado';
    }
  }, [errorMessage, status]);

  const handleHangUp = () => {
    endSession();
    onDismiss();
  };

  const isConnected = status === 'connected';

  return (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>Llamada con Memo</Text>
        <Text style={styles.title}>{statusText}</Text>
        <Text style={styles.description}>{statusDescription}</Text>
      </View>

      <View style={styles.callStage}>
        <Animated.View style={[styles.callHalo, isConnected && styles.callHaloActive, haloAnimatedStyle]}>
          <Image
            source={require('@/assets/MemoIcon1080px.png')}
            style={styles.callIcon}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isMuted ? 'Activar microfono' : 'Silenciar microfono'}
          disabled={!isConnected}
          onPress={() => setMuted(!isMuted)}
          style={({ pressed }) => [
            styles.controlButton,
            !isConnected && styles.controlButtonDisabled,
            pressed && styles.controlButtonPressed,
          ]}>
          <SymbolView
            name={isMuted ? 'mic.slash.fill' : 'mic.fill'}
            tintColor={MemoColors.white}
            size={26}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Finalizar llamada"
          onPress={handleHangUp}
          style={({ pressed }) => [
            styles.controlButton,
            styles.hangUpButton,
            pressed && styles.controlButtonPressed,
          ]}>
          <SymbolView name="phone.down.fill" tintColor={MemoColors.white} size={28} />
        </Pressable>
      </View>
    </View>
  );
}

type ListenSheetBodyProps = {
  insets: EdgeInsets;
};

function ListenSheetBody({ insets }: ListenSheetBodyProps) {
  return (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
      <View style={styles.memoStage}>
        <View style={styles.memoHalo}>
          <Image
            source={require('@/assets/MemoIcon1080px.png')}
            style={styles.memoIcon}
            contentFit="contain"
          />
        </View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>Reunion en vivo</Text>
        <Text style={styles.title}>Modo escucha</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Iniciar grabacion"
        onPress={() => {}}
        style={({ pressed }) => [styles.recordButton, pressed && styles.recordButtonPressed]}>
        <Text style={styles.recordButtonText}>Iniciar grabacion</Text>
      </Pressable>
    </View>
  );
}

const statusColors: Record<ConversationStatus, string> = {
  disconnected: 'rgba(255,255,255,0.16)',
  connecting: 'rgba(165,180,252,0.56)',
  connected: 'rgba(125,211,252,0.58)',
  error: 'rgba(248,113,113,0.6)',
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    minHeight: '100%',
    overflow: 'hidden',
    backgroundColor: '#030712',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  callStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callHalo: {
    width: 184,
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 92,
    borderWidth: 1,
    borderColor: statusColors.connecting,
    backgroundColor: 'rgba(35,133,255,0.18)',
    shadowColor: MemoColors.secondaryBlue,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.42,
    shadowRadius: 48,
  },
  callHaloActive: {
    borderColor: statusColors.connected,
    backgroundColor: 'rgba(14,165,233,0.22)',
  },
  callIcon: {
    width: 118,
    height: 118,
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  controlButton: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  hangUpButton: {
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: '#E11D48',
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
});
