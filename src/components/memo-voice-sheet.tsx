import { BottomSheet, RNHostView } from '@expo/ui';
import { padding, presentationBackground } from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';
import type { MemoMode } from '@/types/memo';

const SHEET_BASE_COLOR = '#020617';

const SHEET_MODIFIERS = [
  padding({ top: -16, leading: -16, trailing: -16 }),
  presentationBackground(SHEET_BASE_COLOR),
];

type ActiveMemoMode = Exclude<MemoMode, null>;

type MemoVoiceSheetProps = {
  mode: ActiveMemoMode | null;
  onDismiss: () => void;
};

const SHEET_COPY: Record<ActiveMemoMode, { title: string; eyebrow: string }> = {
  call: {
    title: 'Llamada con Memo',
    eyebrow: 'Conversacion',
  },
  listen: {
    title: 'Modo escucha',
    eyebrow: 'Reunion en vivo',
  },
};

export function MemoVoiceSheet({ mode, onDismiss }: MemoVoiceSheetProps) {
  const insets = useSafeAreaInsets();

  if (!mode) {
    return null;
  }

  const copy = SHEET_COPY[mode];

  return (
    <BottomSheet
      isPresented
      onDismiss={onDismiss}
      showDragIndicator
      snapPoints={['full']}
      modifiers={SHEET_MODIFIERS}
      testID="memo-voice-sheet">
      <RNHostView>
        <View style={styles.sheet}>
          <LinearGradient
            colors={['#030712', '#071A3A', '#020617']}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
            <View style={styles.memoStage}>
              <View style={styles.memoHalo}>
                <Image
                  source={require('@/assets/MemoIcon1080px.png')}
                  style={styles.memoIcon}
                  contentFit="contain"
                />
              </View>
            </View>

            <View style={styles.copyBlock}>
              <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
              <Text style={styles.title}>{copy.title}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Iniciar grabacion"
              onPress={() => {}}
              style={({ pressed }) => [styles.recordButton, pressed && styles.recordButtonPressed]}>
              <Text style={styles.recordButtonText}>Iniciar grabacion</Text>
            </Pressable>
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    minHeight: '100%',
    overflow: 'hidden',
    backgroundColor: '#030712',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  memoStage: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoHalo: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(35,133,255,0.18)',
    shadowColor: MemoColors.secondaryBlue,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.42,
    shadowRadius: 48,
  },
  memoIcon: {
    width: 142,
    height: 142,
  },
  copyBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: MemoColors.white,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  recordButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: MemoColors.white,
    paddingHorizontal: Spacing.four,
  },
  recordButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  recordButtonText: {
    color: '#03122A',
    fontSize: 17,
    fontWeight: '800',
  },
});
