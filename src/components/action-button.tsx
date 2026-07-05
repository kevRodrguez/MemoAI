import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

type ActionButtonVariant = 'primary' | 'secondary' | 'danger';

export function ActionRow({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.row, style]} />;
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
};

export function ActionButton({ label, onPress, variant = 'primary', disabled }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || disabled) && styles.pressed,
      ]}>
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: MemoColors.secondaryBlue,
    paddingHorizontal: Spacing.three,
  },
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  danger: {
    backgroundColor: 'rgba(255,77,109,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,109,0.42)',
  },
  pressed: {
    opacity: 0.68,
  },
  text: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryText: {
    color: 'rgba(255,255,255,0.82)',
  },
});
