import { Button, Host, Text, TextInput } from '@expo/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

type AuthMode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const { session, initializing, loading, errorMessage, signIn, signUp, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const isSignUp = mode === 'signUp';
  const signInSegmentTextStyle = !isSignUp
    ? { ...styles.segmentText, ...styles.segmentTextActive }
    : styles.segmentText;
  const signUpSegmentTextStyle = isSignUp
    ? { ...styles.segmentText, ...styles.segmentTextActive }
    : styles.segmentText;

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
      <LinearGradient
        colors={['rgba(35,133,255,0)', 'rgba(35,133,255,0.28)', 'rgba(74,168,254,0.44)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomGlow}
      />
      <LinearGradient
        colors={['rgba(35,133,255,0.22)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={styles.cornerGlow}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.brandBlock}>
              <Image source={require('@/assets/MemoLogoName.png')} style={styles.logo} contentFit="contain" />
              <Text textStyle={styles.eyebrow}>Asistente de reuniones</Text>
              <Text textStyle={styles.title}>Tu memoria operativa para cada reunion.</Text>
              <Text textStyle={styles.subtitle}>
                Inicia sesion para capturar contexto, compromisos y tareas personales con Alma.
              </Text>
            </View>

            <View style={styles.formShell}>
              <View style={styles.segmentedControl}>
                <Pressable
                  onPress={() => setMode('signIn')}
                  style={[styles.segment, !isSignUp && styles.segmentActive]}>
                  <Text textStyle={signInSegmentTextStyle}>Entrar</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('signUp')}
                  style={[styles.segment, isSignUp && styles.segmentActive]}>
                  <Text textStyle={signUpSegmentTextStyle}>Crear cuenta</Text>
                </Pressable>
              </View>

              <Host colorScheme="dark" seedColor={MemoColors.mainBlue} style={styles.host}>
                <View style={styles.fields}>
                  {isSignUp && (
                    <>
                      <TextInput
                        placeholder="Nombre"
                        autoCapitalize="words"
                        autoComplete="name"
                        defaultValue={name}
                        onChangeText={setName}
                        style={styles.nativeInput}
                        textStyle={styles.nativeInputText}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                      <TextInput
                        placeholder="Usuario"
                        autoCapitalize="none"
                        autoCorrect={false}
                        defaultValue={userName}
                        onChangeText={setUserName}
                        style={styles.nativeInput}
                        textStyle={styles.nativeInputText}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </>
                  )}

                  <TextInput
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    defaultValue={email}
                    onChangeText={setEmail}
                    style={styles.nativeInput}
                    textStyle={styles.nativeInputText}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={isSignUp ? 'new-password' : 'off'}
                    defaultValue={password}
                    onChangeText={setPassword}
                    style={styles.nativeInput}
                    textStyle={styles.nativeInputText}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />

                  {(localMessage || errorMessage) && (
                    <Text textStyle={styles.errorText}>{localMessage ?? errorMessage ?? ''}</Text>
                  )}

                  <Button
                    label={loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Entrar'}
                    onPress={submit}
                    disabled={loading || initializing}
                    style={styles.primaryButton}
                  />
                </View>
              </Host>
            </View>

            {initializing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={MemoColors.secondaryBlue} />
              </View>
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
    width: 172,
    height: 48,
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
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
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
  host: {
    width: '100%',
  },
  fields: {
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
  },
  nativeInputText: {
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
  },
  loadingOverlay: {
    alignItems: 'center',
  },
});
