import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';

type MemoActionButtonsProps = {
  onOpenProfile: () => void;
  onStartCall: () => void;
  onStartListen: () => void;
};

type ActionButtonProps = {
  label: string;
  symbol: ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
};

export function MemoActionButtons({
  onOpenProfile,
  onStartCall,
  onStartListen,
}: MemoActionButtonsProps) {
  return (
    <View style={styles.actions}>
      <ActionButton
        label="Perfil"
        symbol={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
        onPress={onOpenProfile}
      />
      <ActionButton
        label="Llamada"
        symbol={{ ios: 'phone.fill', android: 'call', web: 'call' }}
        onPress={onStartCall}
      />
      <ActionButton
        label="Escucha"
        symbol={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }}
        onPress={onStartListen}
      />
    </View>
  );
}

function ActionButton({ label, symbol, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <SymbolView name={symbol} tintColor={MemoColors.white} size={20} />
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
