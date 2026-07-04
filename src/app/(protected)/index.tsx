import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedHomeScreen() {
  const { profile, user, loading, signOut } = useAuth();
  const displayName = profile?.name || profile?.user_name || user?.email || 'Memo user';
  const [isSignOutButtonPressed, setIsSignOutButtonPressed] = useState(false);
  const MemoProgress = useSharedValue(0);
  const signOutButtonScale = useSharedValue(1);

  useEffect(() => {
    MemoProgress.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
  }, [MemoProgress]);

  useEffect(() => {
    signOutButtonScale.value = withTiming(isSignOutButtonPressed ? 0.98 : 1, {
      duration: isSignOutButtonPressed ? 120 : 160,
    });
  }, [isSignOutButtonPressed, signOutButtonScale]);

  const MemoAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.24 + MemoProgress.value * 0.22,
    transform: [
      { translateY: -4 * MemoProgress.value },
      { scale: 1 + MemoProgress.value * 0.035 },
    ],
  }));

  const statusDotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.56 + MemoProgress.value * 0.44,
    transform: [{ scale: 0.85 + MemoProgress.value * 0.28 }],
  }));

  const signOutButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signOutButtonScale.value }],
  }));

  return (
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.header}>
            <Image source={require('@/assets/MemoLogoName.png')} style={styles.logo} contentFit="contain" />
            <View style={styles.statusPill}>
              <Animated.View style={[styles.statusDot, statusDotAnimatedStyle]} />
              <Text style={styles.statusText}>Sesion activa</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(620).delay(160)} style={styles.hero}>
            <Animated.View style={[styles.MemoOrb, MemoAnimatedStyle]}>
              <Image source={require('@/assets/MemoIcon1080px.png')} style={styles.MemoLogo} contentFit="contain" />
            </Animated.View>

            <Text style={styles.eyebrow}>{`Hola, ${displayName}`}</Text>
            <Text style={styles.title}>Memo esta lista para tu proxima reunion.</Text>
            <Text style={styles.subtitle}>
              Auth y perfil ya estan conectados. El siguiente paso natural es capturar audio,
              generar transcripcion y convertir compromisos en tareas personales.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(620).delay(260)} style={styles.profilePanel}>
            <Text style={styles.panelTitle}>Perfil</Text>
            <Animated.View entering={FadeIn.duration(360).delay(380)}>
              <ProfileRow label="Nombre" value={profile?.name ?? 'Pendiente'} />
            </Animated.View>
            <Animated.View entering={FadeIn.duration(360).delay(440)}>
              <ProfileRow label="Usuario" value={profile?.user_name ?? 'Pendiente'} />
            </Animated.View>
            <Animated.View entering={FadeIn.duration(360).delay(500)}>
              <ProfileRow label="Email" value={profile?.email ?? user?.email ?? 'Pendiente'} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(420).delay(560)}
              style={signOutButtonAnimatedStyle}>
              <Pressable
                onPress={signOut}
                onPressIn={() => setIsSignOutButtonPressed(true)}
                onPressOut={() => setIsSignOutButtonPressed(false)}
                disabled={loading}
                style={[styles.signOutButton, loading && styles.signOutButtonPressed]}>
                <Text style={styles.signOutButtonText}>{loading ? 'Cerrando...' : 'Cerrar sesion'}</Text>
              </Pressable>
            </Animated.View>
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
    gap: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  logo: {
    width: 132,
    height: 38,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MemoColors.secondaryBlue,
  },
  statusText: {
    color: MemoColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    gap: Spacing.three,
  },
  MemoOrb: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 72,
    backgroundColor: 'rgba(35,133,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.42)',
  },
  MemoLogo: {
    width: 92,
    height: 92,
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
  profilePanel: {
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    backgroundColor: 'rgba(4,10,26,0.72)',
    padding: Spacing.four,
  },
  panelTitle: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
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
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonPressed: {
    opacity: 0.72,
  },
  signOutButtonText: {
    color: MemoColors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
