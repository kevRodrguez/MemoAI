import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

type AuthMode = 'signIn' | 'signUp';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AuthScreen() {
  const { session, initializing, loading, errorMessage, signIn, signUp, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [isPrimaryButtonPressed, setIsPrimaryButtonPressed] = useState(false);
  const segmentIndex = useSharedValue(0);
  const glowProgress = useSharedValue(0);
  const primaryButtonScale = useSharedValue(1);
  const isSignUp = mode === 'signUp';
  const signInSegmentTextStyle = !isSignUp
    ? { ...styles.segmentText, ...styles.segmentTextActive }
    : styles.segmentText;
  const signUpSegmentTextStyle = isSignUp
    ? { ...styles.segmentText, ...styles.segmentTextActive }
    : styles.segmentText;

  useEffect(() => {
    segmentIndex.value = withTiming(isSignUp ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [isSignUp, segmentIndex]);

  useEffect(() => {
    glowProgress.value = withRepeat(
      withTiming(1, {
        duration: 4200,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [glowProgress]);

  useEffect(() => {
    primaryButtonScale.value = withTiming(isPrimaryButtonPressed ? 0.98 : 1, {
      duration: isPrimaryButtonPressed ? 120 : 160,
    });
  }, [isPrimaryButtonPressed, primaryButtonScale]);

  const segmentIndicatorStyle = useAnimatedStyle(() => {
    const itemWidth = (segmentWidth - 8) / 2;
    return {
      width: itemWidth,
      transform: [{ translateX: segmentIndex.value * itemWidth }],
    };
  });

  const bottomGlowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.74 + glowProgress.value * 0.26,
    transform: [
      { translateY: -10 * glowProgress.value },
      { scale: 1 + glowProgress.value * 0.035 },
    ],
  }));

  const cornerGlowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + glowProgress.value * 0.24,
    transform: [
      { translateX: 8 * glowProgress.value },
      { translateY: -6 * glowProgress.value },
      { scale: 1 + glowProgress.value * 0.06 },
    ],
  }));

  const primaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));

  function handleSegmentLayout(event: LayoutChangeEvent) {
    setSegmentWidth(event.nativeEvent.layout.width);
  }

  if (session) {
    return <Redirect href="/" />;
  }

  async function submit() {
    clearError();
    setLocalMessage(null);

    if (!email.trim() || !password) {
      setLocalMessage('Ingresa email y password.');
      return;
    }

    if (isSignUp && (!name.trim() || !userName.trim())) {
      setLocalMessage('Completa nombre y usuario para crear tu perfil.');
      return;
    }

    try {
      if (isSignUp) {
        await signUp({ name, userName, email, password });
      } else {
        await signIn({ email, password });
      }
    } catch {
      // El provider expone el mensaje para mantener una sola fuente de error.
    }
  }

  return (
    <View style={styles.screen}>
      <AnimatedLinearGradient
        colors={['rgba(35,133,255,0)', 'rgba(35,133,255,0.28)', 'rgba(74,168,254,0.44)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={[styles.bottomGlow, bottomGlowAnimatedStyle]}
      />
      <AnimatedLinearGradient
        colors={['rgba(35,133,255,0.22)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        pointerEvents="none"
        style={[styles.cornerGlow, cornerGlowAnimatedStyle]}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(580).delay(80)} style={styles.brandBlock}>
              <Image
                source={require('@/assets/MemoLogoNameWhite.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.eyebrow}>Asistente de reuniones</Text>
              <Text style={styles.title}>Tu memoria operativa para cada reunion.</Text>
              <Text style={styles.subtitle}>
                Inicia sesion para capturar contexto, compromisos y tareas personales con Memo.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(620).delay(180)} style={styles.formShell}>
              <Animated.View
                entering={FadeIn.duration(420).delay(280)}
                style={styles.segmentedControl}
                onLayout={handleSegmentLayout}>
                {segmentWidth > 0 && (
                  <Animated.View style={[styles.segmentIndicator, segmentIndicatorStyle]} />
                )}
                <Pressable onPress={() => setMode('signIn')} style={styles.segment}>
                  <Text style={signInSegmentTextStyle}>Entrar</Text>
                </Pressable>
                <Pressable onPress={() => setMode('signUp')} style={styles.segment}>
                  <Text style={signUpSegmentTextStyle}>Crear cuenta</Text>
                </Pressable>
              </Animated.View>

              <Animated.View
                layout={LinearTransition.duration(280).easing(Easing.inOut(Easing.ease))}
                style={styles.fields}>
                {isSignUp && (
                  <Animated.View
                    entering={FadeIn.duration(240).easing(Easing.inOut(Easing.ease))}
                    exiting={FadeOut.duration(180).easing(Easing.inOut(Easing.ease))}
                    style={styles.signUpFields}>
                    <TextInput
                      placeholder="Nombre"
                      autoCapitalize="words"
                      autoComplete="name"
                      value={name}
                      onChangeText={setName}
                      style={styles.nativeInput}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    <TextInput
                      placeholder="Usuario"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={userName}
                      onChangeText={setUserName}
                      style={styles.nativeInput}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </Animated.View>
                )}

                <Animated.View entering={FadeInDown.duration(420).delay(320)}>
                  <TextInput
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.nativeInput}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </Animated.View>
                <Animated.View entering={FadeInDown.duration(420).delay(380)}>
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={isSignUp ? 'new-password' : 'off'}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.nativeInput}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </Animated.View>

                {(localMessage || errorMessage) && (
                  <Animated.Text entering={FadeInDown.duration(260)} style={styles.errorText}>
                    {localMessage ?? errorMessage ?? ''}
                  </Animated.Text>
                )}

                <Animated.View
                  entering={FadeInDown.duration(420).delay(440)}
                  style={primaryButtonAnimatedStyle}>
                  <Pressable
                    onPress={submit}
                    onPressIn={() => setIsPrimaryButtonPressed(true)}
                    onPressOut={() => setIsPrimaryButtonPressed(false)}
                    disabled={loading || initializing}
                    style={[
                      styles.primaryButton,
                      (loading || initializing) && styles.primaryButtonPressed,
                    ]}>
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Entrar'}
                    </Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </Animated.View>

            {initializing && (
              <Animated.View entering={FadeIn.duration(260)} style={styles.loadingOverlay}>
                <ActivityIndicator color={MemoColors.secondaryBlue} />
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  bottomGlow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '54%',
  },
  cornerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 260,
    height: 260,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
  },
  brandBlock: {
    gap: Spacing.three,
  },
  logo: {
    width: 200,
    height: 68,
  },
  eyebrow: {
    color: MemoColors.secondaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: MemoColors.white,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    lineHeight: 23,
  },
  formShell: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    backgroundColor: 'rgba(4,10,26,0.72)',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 4,
    position: 'relative',
  },
  segmentIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    zIndex: 1,
  },
  segmentText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: MemoColors.white,
  },
  fields: {
    gap: Spacing.three,
    overflow: 'hidden',
  },
  signUpFields: {
    gap: Spacing.three,
  },
  nativeInput: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    color: MemoColors.white,
    fontSize: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: MemoColors.mainBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  loadingOverlay: {
    alignItems: 'center',
  },
});
