import { Image } from 'expo-image';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

const EMPTY_VALUE = 'Sin dato';

function formatValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_VALUE;
}

export default function ProfileScreen() {
  const { profile, user, loading, initializing, signOut, refreshProfile } = useAuth();
  const isLoadingProfile = initializing || (Boolean(user) && !profile);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile])
  );

  return (
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>

            <Text style={styles.eyebrow}>Perfil</Text>
            <Text style={styles.title}>Tu cuenta</Text>
            <Text style={styles.subtitle}>
              Datos de tu perfil en Memo.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(160)} style={styles.avatarPanel}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {(profile?.name ?? profile?.user_name ?? user?.email ?? 'M').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <Text style={styles.avatarName}>{formatValue(profile?.name ?? profile?.user_name)}</Text>
            <Text style={styles.avatarEmail}>{formatValue(profile?.email ?? user?.email)}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(220)} style={styles.panel}>
            <Text style={styles.panelTitle}>Datos del perfil</Text>

            {isLoadingProfile ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={MemoColors.secondaryBlue} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
              </View>
            ) : (
              <>
                <ProfileRow label="Nombre" value={formatValue(profile?.name)} />
                <ProfileRow label="Usuario" value={formatValue(profile?.user_name)} />
                <ProfileRow label="Email" value={formatValue(profile?.email ?? user?.email)} />
                <ProfileRow label="Avatar URL" value={formatValue(profile?.avatar_url)} />
              </>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(280)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Conecta tu IA"
              onPress={() => router.push('/connect-ai' as Href)}
              style={({ pressed }) => [styles.connectAiButton, pressed && styles.pressed]}>
              <Text style={styles.connectAiButtonText}>Conecta tu IA</Text>
              <Text style={styles.connectAiButtonHint}>Configura Cursor vía MCP</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(320)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesion"
              onPress={signOut}
              disabled={loading}
              style={({ pressed }) => [
                styles.signOutButton,
                (pressed || loading) && styles.pressed,
              ]}>
              <Text style={styles.signOutButtonText}>
                {loading ? 'Cerrando...' : 'Cerrar sesion'}
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text selectable style={styles.profileValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: BottomTabInset + Spacing.five,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.three,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: {
    color: MemoColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  eyebrow: {
    color: MemoColors.secondaryBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: MemoColors.white,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 16,
    lineHeight: 23,
  },
  avatarPanel: {
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    backgroundColor: 'rgba(4,10,26,0.76)',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(35,133,255,0.24)',
  },
  avatarFallbackText: {
    color: MemoColors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  avatarName: {
    color: MemoColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  avatarEmail: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 15,
    fontWeight: '600',
  },
  panel: {
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    backgroundColor: 'rgba(4,10,26,0.76)',
    padding: Spacing.four,
  },
  panelTitle: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  loadingState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    fontWeight: '600',
  },
  profileRow: {
    gap: 4,
  },
  profileLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    fontWeight: '700',
  },
  profileValue: {
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  connectAiButton: {
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.35)',
    borderRadius: 16,
    backgroundColor: 'rgba(35,133,255,0.12)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 2,
  },
  connectAiButtonText: {
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  connectAiButtonHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  signOutButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,120,120,0.42)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,80,80,0.12)',
  },
  signOutButtonText: {
    color: MemoColors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});
