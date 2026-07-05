import { Button, Host } from '@expo/ui/swift-ui';
import { buttonBorderShape, buttonStyle, controlSize, labelStyle } from '@expo/ui/swift-ui/modifiers';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type MemoActionButtonsProps = {
  onOpenProfile: () => void;
  onStartCall: () => void;
  onStartListen: () => void;
};

type ActionButtonProps = {
  label: string;
  systemImage: NonNullable<ComponentProps<typeof Button>['systemImage']>;
  onPress: () => void;
};

const buttonModifiers = [
  buttonStyle('glass'),
  controlSize('large'),
  buttonBorderShape('circle'),
  labelStyle('iconOnly'),
];

export function MemoActionButtons({
  onOpenProfile,
  onStartCall,
  onStartListen,
}: MemoActionButtonsProps) {
  return (
    <View style={styles.actions}>
      <ActionButton label="Llamada con Memo" systemImage="phone.fill" onPress={onStartCall} />
      <ActionButton label="Modo escucha" systemImage="waveform" onPress={onStartListen} />
      <ActionButton label="Perfil" systemImage="person.crop.circle" onPress={onOpenProfile} />
    </View>
  );
}

function ActionButton({ label, systemImage, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <Host matchContents ignoreSafeArea="all" pointerEvents="none" style={styles.host}>
        <Button label={label} systemImage={systemImage} modifiers={buttonModifiers} />
      </Host>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 152,
    minHeight: 44,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  host: {
    minWidth: 44,
    minHeight: 44,
  },
});
