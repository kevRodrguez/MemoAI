import { StyleProp, ViewStyle } from 'react-native';

import { AlmaModeDialog } from '@/components/alma-mode-dialog';
import type { AlmaMode } from '@/types/alma';

type AlmaModeTriggerProps = {
  children: React.ReactNode;
  onSelectMode: (mode: Exclude<AlmaMode, null>) => void;
  style?: StyleProp<ViewStyle>;
};

export function AlmaModeTrigger({ children, onSelectMode }: AlmaModeTriggerProps) {
  return <AlmaModeDialog onSelectMode={onSelectMode}>{children}</AlmaModeDialog>;
}
