import { Button, Host, Row, TextInput } from '@expo/ui';
import { StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';

type MemoChatComposerProps = {
  value: string;
  loading: boolean;
  errorMessage: string | null;
  latestReply: string | null;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function MemoChatComposer({
  value,
  loading,
  errorMessage,
  latestReply,
  onChangeText,
  onSubmit,
}: MemoChatComposerProps) {
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
        <Row spacing={8}>
          <TextInput
            value={value}
            editable={!loading}
            placeholder="Escribele a Memo..."
            placeholderTextColor="rgba(255,255,255,0.48)"
            returnKeyType="send"
            enterKeyHint="send"
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            style={styles.input}
            textStyle={styles.inputText}
          />
          <Button label={loading ? 'Enviando' : 'Enviar'} onPress={onSubmit} variant="filled" />
        </Row>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    backgroundColor: 'rgba(4,10,26,0.78)',
    padding: 12,
  },
  host: {
    minHeight: 48,
  },
  input: {
    minWidth: 0,
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
  },
  inputText: {
    color: MemoColors.white,
    fontSize: 15,
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
