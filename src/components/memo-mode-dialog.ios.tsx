import { Button, ConfirmationDialog, Host, Text } from '@expo/ui/swift-ui';
import { StyleSheet, View } from 'react-native';

import type { AlmaMode } from '@/types/alma';

type AlmaModeDialogProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<AlmaMode, null>) => void;
};

export function AlmaModeDialog({ children, onSelectMode }: AlmaModeDialogProps) {
  return (
    <View style={styles.wrapper}>
      <Host matchContents style={styles.host}>
        <ConfirmationDialog title="Activar Alma">
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

export function showAlmaModeDialog() {
  // The iOS implementation is rendered through AlmaModeDialog.
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
