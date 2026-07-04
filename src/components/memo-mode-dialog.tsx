import { Alert } from 'react-native';

import type { MemoMode } from '@/types/memo';

type ShowMemoModeDialogInput = {
  onSelectMode: (mode: Exclude<MemoMode, null>) => void;
};

export function showMemoModeDialog({ onSelectMode }: ShowMemoModeDialogInput) {
  Alert.alert('Activar Memo', 'Elige como quieres iniciar la sesion.', [
    {
      text: 'Llamada con Memo',
      onPress: () => onSelectMode('call'),
    },
    {
      text: 'Modo escucha',
      onPress: () => onSelectMode('listen'),
    },
    {
      text: 'Cancelar',
      style: 'cancel',
    },
  ]);
}
