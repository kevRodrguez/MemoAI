import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { MemoActionButtons } from '@/components/memo-action-buttons';
import { MemoChatBubble } from '@/components/memo-chat-bubble';
import { MemoChatComposer } from '@/components/memo-chat-composer';
import { MemoChatTypingIndicator } from '@/components/memo-chat-typing-indicator';
import { MemoModeTrigger } from '@/components/memo-mode-trigger';
import { MemoPersonalityPills } from '@/components/memo-personality-pills';
import { MemoVoiceSheet } from '@/components/memo-voice-sheet';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTabBar } from '@/context/tab-bar-context';
import { useAuth } from '@/providers/auth-provider';
import { getReplyFromWebhook, sendMemoChatMessage } from '@/services/memo-webhooks';
import type { MemoChatMessage, MemoMode, MemoPersonality, MemoStatus } from '@/types/memo';

const STATUS_COPY: Record<MemoStatus, string> = {
  off: '¡Hablemos!',
  listening: 'Escuchando',
  thinking: 'Pensando',
  speaking: 'Hablando',
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getMemoStatus(isSending: boolean, hasMemoReply: boolean): MemoStatus {
  if (isSending) {
    return 'thinking';
  }

  if (hasMemoReply) {
    return 'speaking';
  }

  return 'off';
}

export default function ProtectedHomeScreen() {
  const { profile, user } = useAuth();
  const { isTabBarHidden, setIsTabBarHidden } = useTabBar();
  const insets = useSafeAreaInsets();
  const threadRef = useRef<ScrollView>(null);
  const [voiceSheetMode, setVoiceSheetMode] = useState<MemoMode>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MemoChatMessage[]>([]);
  const [personality, setPersonality] = useState<MemoPersonality>('casual');
  const [isSending, setIsSending] = useState(false);
  const [composerResetKey, setComposerResetKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const pulseProgress = useSharedValue(0);
  const hasMemoReply = messages.some((item) => item.role === 'memo');
  const status = getMemoStatus(isSending, hasMemoReply);
  const hasMessages = messages.length > 0;

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasMessages) {
      return;
    }

    const timeout = setTimeout(() => {
      threadRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [hasMessages, messages.length, isSending]);

  const revealTabBarGesture = useMemo(
    () =>
      Gesture.Pan()
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
    if (status === 'thinking') {
      return 'Analizando tu contexto';
    }

    if (status === 'speaking') {
      return 'Listo para seguir conversando';
    }

    return `Hola, ${displayName}`;
  }, [displayName, status]);

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

  const keyboard = useAnimatedKeyboard();
  const composerHiddenBottom = insets.bottom + Spacing.two;
  const composerVisibleBottom = BottomTabInset + Spacing.five;
  const tabBarProgress = useSharedValue(isTabBarHidden ? 0 : 1);

  useEffect(() => {
    tabBarProgress.value = withTiming(isTabBarHidden ? 0 : 1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isTabBarHidden, tabBarProgress]);

  const composerAnimatedStyle = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboard.height.value > 0;

    return {
      gap: isKeyboardOpen ? Spacing.one : Spacing.two,
      paddingBottom: isKeyboardOpen
        ? keyboard.height.value
        : composerHiddenBottom +
          (composerVisibleBottom - composerHiddenBottom) * tabBarProgress.value,
    };
  });

  const navbarHintProgress = useSharedValue(0);

  useEffect(() => {
    if (!isKeyboardVisible) {
      navbarHintProgress.value = withRepeat(
        withTiming(1, {
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      );
      return;
    }

    navbarHintProgress.value = 0;
  }, [isKeyboardVisible, navbarHintProgress]);

  const navbarRevealHintStyle = useAnimatedStyle(() => ({
    opacity: 0.42 + navbarHintProgress.value * 0.38,
    transform: [
      {
        translateY: (1 - tabBarProgress.value * 2) * -5 * navbarHintProgress.value,
      },
    ],
  }));

  const handleOpenVoiceSheet = (nextMode: Exclude<MemoMode, null>) => {
    setVoiceSheetMode(nextMode);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    const profileId = profile?.profile_id;

    if (!trimmedMessage || isSending) {
      return;
    }

    if (!profileId) {
      setErrorMessage('No se encontro tu perfil para enviar el mensaje.');
      return;
    }

    const userMessage: MemoChatMessage = {
      id: createMessageId(),
      role: 'user',
      text: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    setIsSending(true);
    setErrorMessage(null);
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage('');
    setComposerResetKey((currentKey) => currentKey + 1);

    try {
      const response = await sendMemoChatMessage({
        message: trimmedMessage,
        profile_id: profileId,
        personality,
      });

      const reply =
        getReplyFromWebhook(response) ?? 'Memo recibio tu mensaje, pero no devolvio una respuesta.';

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: 'memo',
          text: reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error ? error.message : 'No se pudo enviar el mensaje a Memo.';
      setErrorMessage(nextErrorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenProfile = useCallback(() => {
    router.push('/profile' as Href);
  }, []);

  return (
    <GradientBackground>
      <View style={styles.screen}>
        <View style={styles.screenBody}>
          <ScrollView
            ref={threadRef}
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={styles.scrollContent}>
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
                  onOpenProfile={handleOpenProfile}
                  onStartCall={() => handleOpenVoiceSheet('call')}
                  onStartListen={() => handleOpenVoiceSheet('listen')}
                />
              </Animated.View>

              {hasMessages ? (
                <View style={styles.thread}>
                  {messages.map((chatMessage) => (
                    <MemoChatBubble key={chatMessage.id} message={chatMessage} />
                  ))}
                  {isSending ? <MemoChatTypingIndicator /> : null}
                </View>
              ) : !isKeyboardVisible ? (
                <Animated.View
                  entering={FadeInDown.duration(620).delay(160)}
                  exiting={FadeOut.duration(180)}
                  style={styles.centerStage}>
                  <MemoModeTrigger onSelectMode={handleOpenVoiceSheet} style={styles.trigger}>
                    <Animated.View style={[styles.memoBubble, styles[status], bubbleAnimatedStyle]}>
                      <Image
                        source={require('@/assets/MemoIcon1080px.png')}
                        style={styles.memoIcon}
                        contentFit="contain"
                      />
                    </Animated.View>
                  </MemoModeTrigger>

                  <View style={styles.statusBlock}>
                    <Text style={styles.statusDescription}>{statusDescription}</Text>
                  </View>
                  <Text style={styles.statusText}>{STATUS_COPY[status]}</Text>
                </Animated.View>
              ) : null}
            </SafeAreaView>
          </ScrollView>

          <GestureDetector gesture={revealTabBarGesture}>
            <Animated.View
              entering={FadeInDown.duration(620).delay(260)}
              style={[styles.composerShell, composerAnimatedStyle]}>
              {!isKeyboardVisible ? (
                <Animated.View
                  entering={FadeIn.duration(220)}
                  exiting={FadeOut.duration(150)}
                  style={navbarRevealHintStyle}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isTabBarHidden
                        ? 'Desliza hacia arriba para mostrar la barra de navegacion'
                        : 'Desliza hacia abajo para ocultar la barra de navegacion'
                    }
                    hitSlop={12}
                    onPress={() => setIsTabBarHidden((hidden) => !hidden)}
                    style={styles.navbarRevealHint}>
                    <SymbolView
                      name={
                        isTabBarHidden
                          ? { ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' }
                          : {
                              ios: 'chevron.down',
                              android: 'keyboard_arrow_down',
                              web: 'keyboard_arrow_down',
                            }
                      }
                      tintColor="rgba(255,255,255,0.72)"
                      size={20}
                    />
                  </Pressable>
                </Animated.View>
              ) : null}
              {isKeyboardVisible ? (
                <MemoPersonalityPills value={personality} onChange={setPersonality} />
              ) : null}
              <MemoChatComposer
                loading={isSending}
                resetKey={composerResetKey}
                errorMessage={errorMessage}
                onChangeText={setMessage}
                onSubmit={handleSendMessage}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
      <MemoVoiceSheet mode={voiceSheetMode} onDismiss={() => setVoiceSheetMode(null)} />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenBody: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
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
  thread: {
    flex: 1,
    gap: 14,
    paddingBottom: Spacing.three,
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
  composerShell: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  navbarRevealHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
});
