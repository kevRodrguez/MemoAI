import { Pressable, StyleProp, ViewStyle } from 'react-native';

import { showMemoModeDialog } from '@/components/memo-mode-dialog';
import type { MemoMode } from '@/types/memo';

type MemoModeTriggerProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<MemoMode, null>) => void;
  style?: StyleProp<ViewStyle>;
};

export function MemoModeTrigger({ children, onSelectMode, style }: MemoModeTriggerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Activar Memo"
      onPress={() => showMemoModeDialog({ onSelectMode })}
      style={style}>
      {children}
    </Pressable>
  );
}
