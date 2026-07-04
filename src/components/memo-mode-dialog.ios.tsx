import { Button, ConfirmationDialog, Host, Text } from '@expo/ui/swift-ui';
import { StyleSheet, View } from 'react-native';

import type { MemoMode } from '@/types/memo';

type MemoModeDialogProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<MemoMode, null>) => void;
};

export function MemoModeDialog({ children, onSelectMode }: MemoModeDialogProps) {
  return (
    <View style={styles.wrapper}>
      <Host matchContents style={styles.host}>
        <ConfirmationDialog title="Activar Memo">
          <ConfirmationDialog.Trigger>{children}</ConfirmationDialog.Trigger>
          <ConfirmationDialog.Message>
            <Text>Elige como quieres iniciar la sesion.</Text>
          </ConfirmationDialog.Message>
          <ConfirmationDialog.Actions>
            <Button label="Llamada con Memo" systemImage="phone.fill" onPress={() => onSelectMode('call')} />
            <Button label="Modo escucha" systemImage="waveform" onPress={() => onSelectMode('listen')} />
            <Button label="Cancelar" role="cancel" />
          </ConfirmationDialog.Actions>
        </ConfirmationDialog>
      </Host>
    </View>
  );
}

export function showMemoModeDialog() {
  // The iOS implementation is rendered through MemoModeDialog.
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  host: {
    width: 236,
    height: 236,
  },
});
