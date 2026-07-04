import { Button, HStack, Host } from '@expo/ui/swift-ui';
import { buttonBorderShape, buttonStyle, controlSize, labelStyle } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

type AlmaActionButtonsProps = {
  onOpenProfile: () => void;
  onStartCall: () => void;
  onStartListen: () => void;
};

export function AlmaActionButtons({
  onOpenProfile,
  onStartCall,
  onStartListen,
}: AlmaActionButtonsProps) {
  const modifiers = [
    buttonStyle('glass'),
    controlSize('large'),
    buttonBorderShape('circle'),
    labelStyle('iconOnly'),
  ];

  return (
    <Host matchContents style={styles.host}>
      <HStack spacing={8}>
        <Button
          label="Perfil"
          systemImage="person.crop.circle"
          modifiers={modifiers}
          onPress={onOpenProfile}
        />
        <Button
          label="Llamada con Memo"
          systemImage="phone.fill"
          modifiers={modifiers}
          onPress={onStartCall}
        />
        <Button
          label="Modo escucha"
          systemImage="waveform"
          modifiers={modifiers}
          onPress={onStartListen}
        />
      </HStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    minWidth: 152,
    minHeight: 44,
  },
});
