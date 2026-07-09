import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

type MemoMeetingAudioPlayerProps = {
  audioUrl: string;
};

function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function MemoMeetingAudioPlayer({ audioUrl }: MemoMeetingAudioPlayerProps) {
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const progress = useMemo(() => {
    if (!status.duration || status.duration <= 0) {
      return 0;
    }

    return Math.min(1, status.currentTime / status.duration);
  }, [status.currentTime, status.duration]);

  const handleTogglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }

    player.play();
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <SymbolView
          name={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }}
          tintColor={MemoColors.secondaryBlue}
          size={18}
        />
        <Text style={styles.label}>Grabacion de la reunion</Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={status.playing ? 'Pausar audio' : 'Reproducir audio'}
          onPress={handleTogglePlayback}
          style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
          <SymbolView
            name={status.playing ? 'pause.fill' : 'play.fill'}
            tintColor={MemoColors.white}
            size={22}
          />
        </Pressable>

        <View style={styles.timeline}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatPlaybackTime(status.currentTime)}</Text>
            <Text style={styles.timeText}>{formatPlaybackTime(status.duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.28)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  playButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.42)',
    backgroundColor: 'rgba(35,133,255,0.22)',
  },
  timeline: {
    flex: 1,
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: MemoColors.secondaryBlue,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
