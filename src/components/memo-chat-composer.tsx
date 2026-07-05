import { Button, Host, Row, TextInput } from '@expo/ui';
import { StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';

type MemoChatComposerProps = {
  loading: boolean;
  resetKey: number;
  errorMessage: string | null;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function MemoChatComposer({
  loading,
  resetKey,
  errorMessage,
  onChangeText,
  onSubmit,
}: MemoChatComposerProps) {
  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Host matchContents={{ vertical: true }} style={styles.host}>
        <Row spacing={8}>
          <TextInput
            key={resetKey}
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
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
});
