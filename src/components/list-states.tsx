import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export function LoadingPanel({ message }: { message: string }) {
  return (
    <View style={styles.loadingPanel}>
      <ActivityIndicator color={MemoColors.secondaryBlue} />
      <Text style={styles.mutedText}>{message}</Text>
    </View>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: '#ffb4b4',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingPanel: {
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    backgroundColor: 'rgba(4,10,26,0.72)',
    padding: Spacing.four,
  },
  mutedText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 15,
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
