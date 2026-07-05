import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { profile, user, loading, signOut } = useAuth();

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
            <Text style={styles.title}>Tu cuenta de Memo</Text>
            <Text style={styles.subtitle}>
              La gestion completa de perfil, avatar y preferencias estara disponible proximamente.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(180)} style={styles.panel}>
            <ProfileRow label="Nombre" value={profile?.name ?? 'Pendiente'} />
            <ProfileRow label="Usuario" value={profile?.user_name ?? 'Pendiente'} />
            <ProfileRow label="Email" value={profile?.email ?? user?.email ?? 'Pendiente'} />
            <ProfileRow label="Profile ID" value={profile?.profile_id ?? 'Pendiente'} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(260)} style={styles.panel}>
            <Text style={styles.panelTitle}>Proximamente</Text>
            <Text style={styles.panelText}>
              Preferencias de voz, privacidad de reuniones, datos personales y configuracion de sesion.
            </Text>

            <Pressable
              onPress={signOut}
              disabled={loading}
              style={({ pressed }) => [
                styles.signOutButton,
                (pressed || loading) && styles.pressed,
              ]}>
              <Text style={styles.signOutButtonText}>{loading ? 'Cerrando...' : 'Cerrar sesion'}</Text>
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
      <Text style={styles.profileValue} numberOfLines={1}>
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
  panelText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 15,
    lineHeight: 22,
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
  signOutButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 16,
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
