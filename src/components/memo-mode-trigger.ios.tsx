import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Button, ConfirmationDialog, Host, Text } from '@expo/ui/swift-ui';

import type { MemoMode } from '@/types/memo';

type MemoModeTriggerProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<MemoMode, null>) => void;
  style?: StyleProp<ViewStyle>;
};

export function MemoModeTrigger({ children, onSelectMode, style }: MemoModeTriggerProps) {
  const [isPresented, setIsPresented] = useState(false);

  const handleSelectMode = (mode: Exclude<MemoMode, null>) => {
    setIsPresented(false);
    onSelectMode(mode);
  };

  return (
    <View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Activar Memo"
        onPress={() => setIsPresented(true)}>
        {children}
      </Pressable>

      <View pointerEvents="none" style={styles.dialogHost}>
        <Host matchContents>
          <ConfirmationDialog
            title="Activar Memo"
            isPresented={isPresented}
            onIsPresentedChange={setIsPresented}>
            <ConfirmationDialog.Trigger>
              <Button label="Activar Memo" />
            </ConfirmationDialog.Trigger>
            <ConfirmationDialog.Message>
              <Text>Elige como quieres iniciar la sesion.</Text>
            </ConfirmationDialog.Message>
            <ConfirmationDialog.Actions>
              <Button
                label="Llamada con Memo"
                systemImage="phone.fill"
                onPress={() => handleSelectMode('call')}
              />
              <Button
                label="Modo escucha"
                systemImage="waveform"
                onPress={() => handleSelectMode('listen')}
              />
              <Button label="Cancelar" role="cancel" onPress={() => setIsPresented(false)} />
            </ConfirmationDialog.Actions>
          </ConfirmationDialog>
        </Host>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dialogHost: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
