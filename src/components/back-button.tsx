import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

type BackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function BackButton({ onPress, label = '‹ Volver' }: BackButtonProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  text: {
    color: MemoColors.secondaryBlue,
    fontSize: 16,
    fontWeight: '800',
  },
});
