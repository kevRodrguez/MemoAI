import { Image } from 'expo-image';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { MemoActionButtons } from '@/components/memo-action-buttons';
import { MemoChatComposer } from '@/components/memo-chat-composer';
import { MemoModeTrigger } from '@/components/memo-mode-trigger';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTabBar } from '@/context/tab-bar-context';
import { sendMemoChatMessage } from '@/services/memo-webhooks';
import type { MemoChatWebhookResponse, MemoMode, MemoStatus } from '@/types/memo';
import { useAuth } from '@/providers/auth-provider';

const STATUS_COPY: Record<MemoStatus, string> = {
  off: '¡Hablemos!',
  listening: 'Escuchando',
  thinking: 'Pensando',
  speaking: 'Hablando',
};

function getMemoStatus(mode: MemoMode, isSending: boolean, latestReply: string | null): MemoStatus {
  if (isSending) {
    return 'thinking';
  }

  if (latestReply) {
    return 'speaking';
  }

  if (mode === 'call' || mode === 'listen') {
    return 'listening';
  }

  return 'off';
}

function getReplyFromWebhook(response: MemoChatWebhookResponse) {
  return response.reply ?? response.message ?? response.text ?? null;
}

export default function ProtectedHomeScreen() {
  const { profile, user } = useAuth();
  const { isTabBarHidden, setIsTabBarHidden } = useTabBar();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<MemoMode>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [composerResetKey, setComposerResetKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestReply, setLatestReply] = useState<string | null>(null);

  const pulseProgress = useSharedValue(0);
  const status = getMemoStatus(mode, isSending, latestReply);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const revealTabBarGesture = useMemo(
    () =>
      Gesture.Pan()
        .simultaneousWithExternalGesture(
          scrollRef as unknown as React.RefObject<React.ComponentType>
        )
        .activeOffsetY([-14, 14])
        .failOffsetX([-28, 28])
        .onEnd((event) => {
          'worklet';
          if (event.translationY < -30) {
            runOnJS(setIsTabBarHidden)(false);
          } else if (event.translationY > 30) {
            runOnJS(setIsTabBarHidden)(true);
          }
        }),
    [setIsTabBarHidden]
  );
  const displayName = profile?.name || profile?.user_name || user?.email || 'Memo user';

  const statusDescription = useMemo(() => {
    if (status === 'listening' && mode === 'call') {
      return 'Modo llamada preparado';
    }

    if (status === 'listening' && mode === 'listen') {
      return 'Modo escucha preparado';
    }

    if (status === 'thinking') {
      return 'Enviando contexto a n8n';
    }

    if (status === 'speaking') {
      return 'Respuesta recibida';
    }

    return `Hola, ${displayName}`;
  }, [displayName, mode, status]);

  useEffect(() => {
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: status === 'off' ? 3200 : 1700,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
  }, [pulseProgress, status]);

  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    const activeScale = status === 'off' ? 0.018 : 0.052;

    return {
      shadowOpacity: 0.18 + pulseProgress.value * 0.28,
      transform: [
        { translateY: -5 * pulseProgress.value },
        { scale: 1 + pulseProgress.value * activeScale },
      ],
    };
  });

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.36 + pulseProgress.value * 0.38,
    transform: [{ scale: 1 + pulseProgress.value * 0.12 }],
  }));

  const composerHiddenBottom = insets.bottom + Spacing.two;
  const composerVisibleBottom = insets.bottom + BottomTabInset + Spacing.two;
  const tabBarProgress = useSharedValue(isTabBarHidden ? 0 : 1);

  useEffect(() => {
    tabBarProgress.value = withTiming(isTabBarHidden ? 0 : 1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isTabBarHidden, tabBarProgress]);

  const composerAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom:
      composerHiddenBottom +
      (composerVisibleBottom - composerHiddenBottom) * tabBarProgress.value,
  }));

  const handleStartMode = (nextMode: Exclude<MemoMode, null>) => {
    setLatestReply(null);
    setErrorMessage(null);
    setMode(nextMode);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setLatestReply(null);

    try {
      const response = await sendMemoChatMessage({
        message: trimmedMessage,
        userId: user?.id ?? null,
        profileId: profile?.profile_id ?? null,
        userEmail: profile?.email ?? user?.email ?? null,
        sentAt: new Date().toISOString(),
        source: 'memo-home',
      });

      setMessage('');
      setComposerResetKey((currentKey) => currentKey + 1);
      setLatestReply(getReplyFromWebhook(response) ?? 'Memo recibio tu mensaje.');
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error ? error.message : 'No se pudo enviar el mensaje a Memo.';
      setErrorMessage(nextErrorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <GradientBackground>
      <GestureDetector gesture={revealTabBarGesture}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            contentContainerStyle={styles.content}>
          <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
            <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mostrar u ocultar la barra de navegacion"
                hitSlop={12}
                onPress={() => setIsTabBarHidden((hidden) => !hidden)}>
                <Image
                  source={require('@/assets/MemoLogoNameWhite.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
              </Pressable>

              <MemoActionButtons
                onOpenProfile={() => router.push('/profile' as Href)}
                onStartCall={() => handleStartMode('call')}
                onStartListen={() => handleStartMode('listen')}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(620).delay(160)} style={styles.centerStage}>
              <MemoModeTrigger onSelectMode={handleStartMode} style={styles.trigger}>

                <Animated.View style={[styles.memoBubble, styles[status], bubbleAnimatedStyle]}>
                  <Image
                    source={require('@/assets/MemoIcon1080px.png')}
                    style={styles.memoIcon}
                    contentFit="contain"
                  />
                </Animated.View>
              </MemoModeTrigger>

              <View style={styles.statusBlock}>
                <Text style={styles.statusText}>{STATUS_COPY[status]}</Text>
                <Text style={styles.statusDescription}>{statusDescription}</Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(620).delay(260)}
              style={[styles.composerShell, composerAnimatedStyle]}>
              <MemoChatComposer
                loading={isSending}
                resetKey={composerResetKey}
                errorMessage={errorMessage}
                latestReply={latestReply}
                onChangeText={setMessage}
                onSubmit={handleSendMessage}
              />
            </Animated.View>
          </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </GestureDetector>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  logo: {
    width: 132,
    height: 38,
  },
  centerStage: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  trigger: {
    width: 236,
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoRing: {
    position: 'absolute',
    width: 232,
    height: 232,
    borderRadius: 116,
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.38)',
    backgroundColor: 'rgba(35,133,255,0.06)',
  },
  memoBubble: {
    width: 184,
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 92,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: MemoColors.secondaryBlue,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 42,
  },
  memoIcon: {
    width: 118,
    height: 118,
  },
  off: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listening: {
    backgroundColor: 'rgba(35,133,255,0.20)',
    borderColor: 'rgba(74,168,254,0.56)',
  },
  thinking: {
    backgroundColor: 'rgba(80,115,255,0.22)',
    borderColor: 'rgba(165,180,252,0.56)',
  },
  speaking: {
    backgroundColor: 'rgba(14,165,233,0.22)',
    borderColor: 'rgba(125,211,252,0.58)',
  },
  statusBlock: {
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: MemoColors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  statusDescription: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  composerShell: {},
});
