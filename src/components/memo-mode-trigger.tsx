import { Pressable, StyleProp, ViewStyle } from 'react-native';

import { showAlmaModeDialog } from '@/components/alma-mode-dialog';
import type { AlmaMode } from '@/types/alma';

type AlmaModeTriggerProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<AlmaMode, null>) => void;
  style?: StyleProp<ViewStyle>;
};

export function AlmaModeTrigger({ children, onSelectMode, style }: AlmaModeTriggerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Activar Alma"
      onPress={() => showAlmaModeDialog({ onSelectMode })}
      style={style}>
      {children}
    </Pressable>
  );
}
