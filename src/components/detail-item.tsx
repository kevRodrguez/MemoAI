import { StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

type DetailItemProps = {
  label: string;
  value: string;
};

export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    gap: Spacing.one,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.three,
  },
  label: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
