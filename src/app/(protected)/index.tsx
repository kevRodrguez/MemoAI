import { Button, Host, Text } from '@expo/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedHomeScreen() {
  const { profile, user, loading, signOut } = useAuth();
  const displayName = profile?.name || profile?.user_name || user?.email || 'Memo user';

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['rgba(35,133,255,0.20)', 'rgba(3,7,18,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={['rgba(3,7,18,0)', 'rgba(35,133,255,0.22)', 'rgba(74,168,254,0.38)']}
        locations={[0, 0.6, 1]}
        style={styles.bottomGlow}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Image source={require('@/assets/MemoLogoName.png')} style={styles.logo} contentFit="contain" />
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text textStyle={styles.statusText}>Sesion activa</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.almaOrb}>
              <Image source={require('@/assets/MemoIcon1080px.png')} style={styles.almaLogo} contentFit="contain" />
            </View>

            <Text textStyle={styles.eyebrow}>{`Hola, ${displayName}`}</Text>
            <Text textStyle={styles.title}>Memo esta lista para tu proxima reunion.</Text>
            <Text textStyle={styles.subtitle}>
              Auth y perfil ya estan conectados. El siguiente paso natural es capturar audio,
              generar transcripcion y convertir compromisos en tareas personales.
            </Text>
          </View>

          <View style={styles.profilePanel}>
            <Text textStyle={styles.panelTitle}>Perfil</Text>
            <ProfileRow label="Nombre" value={profile?.name ?? 'Pendiente'} />
            <ProfileRow label="Usuario" value={profile?.user_name ?? 'Pendiente'} />
            <ProfileRow label="Email" value={profile?.email ?? user?.email ?? 'Pendiente'} />

            <Host colorScheme="dark" seedColor={MemoColors.mainBlue} style={styles.host}>
              <Button
                label={loading ? 'Cerrando...' : 'Cerrar sesion'}
                onPress={signOut}
                disabled={loading}
                variant="outlined"
                style={styles.signOutButton}
              />
            </Host>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text textStyle={styles.profileLabel}>{label}</Text>
      <Text textStyle={styles.profileValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: 280,
  },
  bottomGlow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '50%',
  },
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
  almaOrb: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 72,
    backgroundColor: 'rgba(35,133,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.42)',
  },
  almaLogo: {
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
  host: {
    width: '100%',
  },
  signOutButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderColor: 'rgba(255,255,255,0.24)',
  },
});
