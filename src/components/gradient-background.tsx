import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_BACKGROUND = '#030712';

type GradientBackgroundProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  const orbitProgress = useSharedValue(0);
  const driftProgress = useSharedValue(0);

  useEffect(() => {
    orbitProgress.value = withRepeat(
      withTiming(1, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    driftProgress.value = withRepeat(
      withTiming(1, {
        duration: 7000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [driftProgress, orbitProgress]);

  const topGlowAnimatedStyle = useAnimatedStyle(() => {
    const angle = orbitProgress.value * Math.PI * 2;
    return {
      opacity: 0.68 + driftProgress.value * 0.28,
      transform: [
        { translateX: Math.cos(angle) * 52 - 24 },
        { translateY: Math.sin(angle) * 38 - 18 },
        { scale: 1.05 + driftProgress.value * 0.12 },
        { rotate: `${orbitProgress.value * 18}deg` },
      ],
    };
  });

  const bottomGlowAnimatedStyle = useAnimatedStyle(() => {
    const angle = orbitProgress.value * Math.PI * 2 + Math.PI * 0.65;
    return {
      opacity: 0.7 + (1 - driftProgress.value) * 0.26,
      transform: [
        { translateX: Math.sin(angle) * 64 },
        { translateY: Math.cos(angle) * 28 - 20 },
        { scale: 1.08 + (1 - driftProgress.value) * 0.1 },
      ],
    };
  });

  const accentGlowAnimatedStyle = useAnimatedStyle(() => {
    const angle = orbitProgress.value * Math.PI * 2 + Math.PI;
    return {
      opacity: 0.22 + driftProgress.value * 0.18,
      transform: [
        { translateX: Math.cos(angle) * 40 + 48 },
        { translateY: Math.sin(angle) * 56 + 120 },
        { scale: 0.92 + driftProgress.value * 0.16 },
      ],
    };
  });

  return (
    <View style={[styles.screen, style]}>
      <Animated.View pointerEvents="none" style={[styles.topGlow, topGlowAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(35,133,255,0.28)', 'rgba(35,133,255,0.08)', 'rgba(3,7,18,0)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.bottomGlow, bottomGlowAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(3,7,18,0)', 'rgba(35,133,255,0.24)', 'rgba(74,168,254,0.42)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.gradientFill}
        />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.accentGlow, accentGlowAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(74,168,254,0.18)', 'rgba(35,133,255,0.06)', 'rgba(3,7,18,0)']}
          locations={[0, 0.5, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientFill}
        />
      </Animated.View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 360,
    height: 360,
  },
  bottomGlow: {
    position: 'absolute',
    right: -60,
    bottom: -120,
    left: -60,
    height: '62%',
  },
  accentGlow: {
    position: 'absolute',
    top: '28%',
    right: -100,
    width: 300,
    height: 300,
  },
});
