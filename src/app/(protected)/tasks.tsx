import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function TasksScreen() {
  return (
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.header}>
            <Text style={styles.eyebrow}>Tareas</Text>
            <Text style={styles.title}>Tus compromisos personales</Text>
            <Text style={styles.subtitle}>
              Las tareas detectadas en reuniones apareceran aqui. Solo tu puedes verlas y gestionarlas.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(520).delay(180)} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
            <Text style={styles.emptyText}>
              Memo convertira compromisos hablados en tareas personales durante tus reuniones.
            </Text>
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
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.three,
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
  emptyState: {
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    backgroundColor: 'rgba(4,10,26,0.72)',
    padding: Spacing.four,
  },
  emptyTitle: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 15,
    lineHeight: 22,
  },
});
