import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MemoColors } from '@/assets/colors';
import type { MemoChatMessage } from '@/types/memo';

type MemoChatBubbleProps = {
  message: MemoChatMessage;
};

export function MemoChatBubble({ message }: MemoChatBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.bubbleText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.memoRow}>
      <View style={styles.avatarShell}>
        <Image
          source={require('@/assets/MemoAppIcon.png')}
          style={styles.avatar}
          contentFit="cover"
        />
      </View>
      <View style={styles.memoBubble}>
        <Text style={styles.bubbleText}>{message.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 56,
  },
  memoRow: {
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
  userBubble: {
    maxWidth: '100%',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    backgroundColor: MemoColors.mainBlue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: MemoColors.mainBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  memoBubble: {
    flex: 1,
    maxWidth: '100%',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    color: MemoColors.white,
    fontSize: 15,
    lineHeight: 22,
  },
});
