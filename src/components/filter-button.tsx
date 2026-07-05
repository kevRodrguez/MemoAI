import { Pressable, StyleSheet, Text } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

type FilterButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterButton({ label, active, onPress }: FilterButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.two,
  },
  buttonActive: {
    borderColor: 'rgba(74,168,254,0.50)',
    backgroundColor: 'rgba(74,168,254,0.18)',
  },
  text: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '800',
  },
  textActive: {
    color: MemoColors.white,
  },
});
