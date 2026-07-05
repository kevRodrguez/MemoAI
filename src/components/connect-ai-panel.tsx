import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

const DATAMCP_URL =
  process.env.EXPO_PUBLIC_DATAMCP_CONNECTION_URL ?? 'https://api.datamcp.app/api/mcp/conn_pendiente';
const DATAMCP_API_KEY = process.env.EXPO_PUBLIC_DATAMCP_API_KEY ?? 'pendiente-de-configurar';
const MASKED_API_KEY = '•'.repeat(24);

function buildMcpJson(apiKey: string) {
  return `{
  "mcpServers": {
    "Memo-read-only": {
      "url": "${DATAMCP_URL}",
      "headers": {
        "Authorization": "Bearer ${apiKey}"
      }
    }
  }
}`;
}

const MCP_JSON = buildMcpJson(DATAMCP_API_KEY);
const MASKED_MCP_JSON = buildMcpJson(MASKED_API_KEY);

const STEPS: { title: string; description: string }[] = [
  {
    title: 'Abre Cursor Settings',
    description: 'Presiona `Cmd/Ctrl + Shift + J` y entra a la seccion `Tools & MCPs`.',
  },
  {
    title: 'Entra a Customize',
    description: 'Cursor movio la gestion de MCPs ahi: haz clic en `Open Customize` y selecciona la pestana `MCPs`.',
  },
  {
    title: 'Edita el archivo mcp.json',
    description:
      'Haz clic en `+ New` para abrir tu archivo `mcp.json` (ubicado en `~/.cursor/mcp.json`).',
  },
  {
    title: 'Pega la configuracion',
    description: 'Copia el bloque JSON de arriba tal cual y agregalo dentro de la llave `"mcpServers"` de tu archivo.',
  },
  {
    title: 'Prueba la conexion',
    description:
      'Abre el chat (`Cmd/Ctrl + L`), asegurate de estar en modo `Agent` (no `Ask`) y pidele a la IA: "Analiza mi base de datos de Memo y dame un resumen de la ultima reunion".',
  },
];

const MODE_WARNING =
  'El modo `Ask` de Cursor no ejecuta herramientas MCP. Si la IA responde con "Permission denied" o "Blocked by permissions configuration", cambia el selector de modo (abajo del chat) de `Ask` a `Agent` y vuelve a preguntar.';

const KEY_COLOR = '#7dd3fc';
const STRING_COLOR = '#86efac';
const PUNCTUATION_COLOR = 'rgba(255,255,255,0.55)';
const QUOTED_STRING = /"[^"]*"/g;

function JsonLine({ line }: { line: string }) {
  const matches = [...line.matchAll(QUOTED_STRING)];

  if (matches.length === 0) {
    return <Text style={[styles.codeText, { color: PUNCTUATION_COLOR }]}>{line || ' '}</Text>;
  }

  const segments: { text: string; color: string }[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: line.slice(cursor, start), color: PUNCTUATION_COLOR });
    }
    const isKey = index % 2 === 0 && line[start + match[0].length] === ':';
    segments.push({ text: match[0], color: isKey ? KEY_COLOR : STRING_COLOR });
    cursor = start + match[0].length;
  });

  if (cursor < line.length) {
    segments.push({ text: line.slice(cursor), color: PUNCTUATION_COLOR });
  }

  return (
    <Text style={styles.codeText}>
      {segments.map((segment, index) => (
        <Text key={index} style={{ color: segment.color }}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

function InlineText({ text, style }: { text: string; style?: object }) {
  const parts = text.split('`');

  return (
    <Text style={[styles.stepDescription, style]}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={styles.inlineCode}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

export function ConnectAIPanel() {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(MCP_JSON);
    setCopied(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <Badge label="Cursor" />
        <Badge label="JSON" />
        <Badge label="Conexion segura" tone="secure" />
      </View>

      <Text style={styles.sectionTitle}>Credenciales del servidor MCP</Text>
      <InlineText
        text="Copia este bloque tal cual en tu archivo `mcp.json` de Cursor: ya tiene tu conexion de datos lista, no necesitas crear ni configurar nada."
        style={styles.sectionSubtitle}
      />

      <View style={styles.codeBlock}>
        <View style={styles.codeHeader}>
          <View style={styles.codeHeaderDots}>
            <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
            <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
            <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
          </View>
          <Text style={styles.codeHeaderLabel}>mcp.json</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar API key' : 'Mostrar API key'}
            onPress={() => setRevealed((value) => !value)}
            style={({ pressed }) => [styles.revealButton, pressed && styles.pressed]}>
            <Text style={styles.revealButtonText}>{revealed ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copiar configuracion al portapapeles"
            onPress={handleCopy}
            style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}>
            <Text style={styles.copyButtonText}>{copied ? 'Copiado' : 'Copiar'}</Text>
          </Pressable>
        </View>

        <View style={styles.codeBody}>
          {(revealed ? MCP_JSON : MASKED_MCP_JSON).split('\n').map((line, index) => (
            <JsonLine key={index} line={line} />
          ))}
        </View>
      </View>

      <Text style={[styles.sectionTitle, styles.stepsTitle]}>Guia de instalacion para Cursor</Text>

      <View style={styles.stepsList}>
        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <InlineText text={step.description} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>Modo Agent, no Ask</Text>
        <InlineText text={MODE_WARNING} style={styles.warningText} />
      </View>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone?: 'secure' }) {
  return (
    <View style={[styles.badge, tone === 'secure' && styles.badgeSecure]}>
      <Text style={[styles.badgeText, tone === 'secure' && styles.badgeTextSecure]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    backgroundColor: 'rgba(4,10,26,0.76)',
    padding: Spacing.four,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.35)',
    borderRadius: 999,
    backgroundColor: 'rgba(35,133,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeSecure: {
    borderColor: 'rgba(134,239,172,0.35)',
    backgroundColor: 'rgba(52,211,153,0.14)',
  },
  badgeText: {
    color: MemoColors.secondaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextSecure: {
    color: '#86efac',
  },
  sectionTitle: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: -Spacing.two,
  },
  codeBlock: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: '#0b1220',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  codeHeaderDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  codeHeaderLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  revealButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  revealButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
  },
  copyButton: {
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.4)',
    borderRadius: 10,
    backgroundColor: 'rgba(35,133,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyButtonText: {
    color: MemoColors.secondaryBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  codeBody: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  codeText: {
    fontFamily: 'ui-monospace',
    fontSize: 12.5,
    lineHeight: 19,
  },
  stepsTitle: {
    marginTop: Spacing.two,
  },
  stepsList: {
    gap: Spacing.three,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(35,133,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.4)',
  },
  stepBadgeText: {
    color: MemoColors.secondaryBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: MemoColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  stepDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  inlineCode: {
    fontFamily: 'ui-monospace',
    fontSize: 13,
    color: '#7dd3fc',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  warningBox: {
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.1)',
    padding: Spacing.three,
  },
  warningTitle: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '800',
  },
  warningText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 19,
  },
});
