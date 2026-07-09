import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MemoColors } from '@/assets/colors';

const STATUS_PHRASES = [
  'Consultando tus tareas...',
  'Revisando tus reuniones...',
  'Analizando el contexto...',
  'Organizando la informacion...',
  'Preparando una respuesta...',
  'Buscando senales relevantes...',
  'Sintetizando la lectura...',
];

const PHRASE_INTERVAL_MS = 2400;

type TypingDotProps = {
  delay: number;
};

function TypingDot({ delay }: TypingDotProps) {
  const opacity = useSharedValue(0.28);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 360 }),
          withTiming(0.28, { duration: 360 })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * -3 }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function MemoChatTypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showPhrase, setShowPhrase] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPhrase((current) => {
        if (current) {
          setPhraseIndex((index) => (index + 1) % STATUS_PHRASES.length);
        }

        return !current;
      });
    }, PHRASE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(280)} style={styles.row}>
      <View style={styles.avatarShell}>
        <Image
          source={require('@/assets/MemoAppIcon.png')}
          style={styles.avatar}
          contentFit="cover"
        />
      </View>

      <View style={styles.bubble}>
        {showPhrase ? (
          <Animated.Text
            key={`phrase-${phraseIndex}`}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            style={styles.phraseText}>
            {STATUS_PHRASES[phraseIndex]}
          </Animated.Text>
        ) : (
          <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.dotsRow}>
            <TypingDot delay={0} />
            <TypingDot delay={160} />
            <TypingDot delay={320} />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingRight: 56,
  },
  avatarShell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  phraseText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
