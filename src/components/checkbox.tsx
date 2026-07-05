import { Pressable, StyleSheet, Text } from 'react-native';

import { MemoColors } from '@/assets/colors';

type CheckboxProps = {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function Checkbox({ checked, onPress, disabled }: CheckboxProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={[styles.checkbox, checked && styles.checkboxChecked]}>
      <Text style={styles.checkboxText}>{checked ? 'x' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkboxChecked: {
    borderColor: 'rgba(74,168,254,0.70)',
    backgroundColor: 'rgba(74,168,254,0.24)',
  },
  checkboxText: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
