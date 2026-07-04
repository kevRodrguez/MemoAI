import { Alert } from 'react-native';

import type { AlmaMode } from '@/types/alma';

type ShowAlmaModeDialogInput = {
  onSelectMode: (mode: Exclude<AlmaMode, null>) => void;
};

export function showAlmaModeDialog({ onSelectMode }: ShowAlmaModeDialogInput) {
  Alert.alert('Activar Alma', 'Elige como quieres iniciar la sesion.', [
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
