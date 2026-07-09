import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { ConnectAIPanel } from '@/components/connect-ai-panel';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function ConnectAIScreen() {
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

            <Text style={styles.eyebrow}>Integraciones</Text>
            <Text style={styles.title}>Conecta tu IA</Text>
            <Text style={styles.subtitle}>
              Conecta Cursor u otro cliente MCP a tu cuenta de Memo para consultar tus reuniones y tareas
              directamente desde tu editor.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(160)}>
            <ConnectAIPanel />
          </Animated.View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
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
  pressed: {
    opacity: 0.72,
  },
});
