import { Button, HStack, Host, Text as SwiftText, TextField } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  lineLimit,
  padding,
  textFieldStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';

type MemoChatComposerProps = {
  loading: boolean;
  resetKey: number;
  errorMessage: string | null;
  latestReply: string | null;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

const inputModifiers = [
  textFieldStyle('plain'),
  lineLimit({ min: 1, max: 5 }),
  frame({ maxWidth: 100000 }),
  padding({ horizontal: 18, vertical: 12 }),
  glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'capsule' }),
  foregroundStyle(MemoColors.white),
  tint(MemoColors.secondaryBlue),
];

export function MemoChatComposer({
  loading,
  resetKey,
  errorMessage,
  latestReply,
  onChangeText,
  onSubmit,
}: MemoChatComposerProps) {
  const sendModifiers = [
    buttonStyle('glass'),
    controlSize('large'),
    buttonBorderShape('circle'),
    labelStyle('iconOnly'),
    disabled(loading),
  ];

  return (
    <View style={styles.container}>
      {latestReply ? (
        <View style={styles.replyPanel}>
          <Text style={styles.replyLabel}>Memo</Text>
          <Text style={styles.replyText}>{latestReply}</Text>
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Host matchContents={{ vertical: true }} style={styles.host}>
        <HStack spacing={8} alignment="bottom">
          <TextField
            key={resetKey}
            axis="vertical"
            onTextChange={onChangeText}
            modifiers={inputModifiers}>
            <TextField.Placeholder>
              <SwiftText modifiers={[foregroundStyle('rgba(255,255,255,0.45)')]}>
                Escribele a Memo...
              </SwiftText>
            </TextField.Placeholder>
          </TextField>

          <Button
            label="Enviar"
            systemImage={loading ? 'ellipsis' : 'arrow.up'}
            modifiers={sendModifiers}
            onPress={onSubmit}
          />
        </HStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  host: {
    minHeight: 52,
  },
  replyPanel: {
    gap: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(35,133,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  replyLabel: {
    color: MemoColors.secondaryBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  replyText: {
    color: MemoColors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
});
