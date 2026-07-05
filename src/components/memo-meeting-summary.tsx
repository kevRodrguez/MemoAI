import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';
import type { ListeningModeResult, ListeningTask, ListeningTaskPriority } from '@/types/memo';

const MemoMeetingAudioPlayer = lazy(() =>
  import('@/components/memo-meeting-audio-player').then((module) => ({
    default: module.MemoMeetingAudioPlayer,
  }))
);

export type MeetingSummaryContent = {
  title: string;
  aiSummary: string;
  transcription: string;
  tasks: ListeningTask[];
  audioUrl?: string | null;
  eyebrow?: string;
  tasksLabel?: string;
};

type MemoMeetingSummaryContentProps = MeetingSummaryContent & {
  footer?: ReactNode;
  scrollable?: boolean;
};

type MemoMeetingSummaryProps = {
  result: ListeningModeResult;
  audioUrl?: string | null;
  onDone: () => void;
};

const PRIORITY_STYLES: Record<
  ListeningTaskPriority,
  { label: string; backgroundColor: string; borderColor: string; textColor: string }
> = {
  alta: {
    label: 'Alta',
    backgroundColor: 'rgba(248,113,113,0.16)',
    borderColor: 'rgba(248,113,113,0.42)',
    textColor: '#FCA5A5',
  },
  media: {
    label: 'Media',
    backgroundColor: 'rgba(251,191,36,0.14)',
    borderColor: 'rgba(251,191,36,0.38)',
    textColor: '#FCD34D',
  },
  baja: {
    label: 'Baja',
    backgroundColor: 'rgba(74,168,254,0.14)',
    borderColor: 'rgba(74,168,254,0.38)',
    textColor: '#93C5FD',
  },
};

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const date = new Date(`${deadline}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function splitSummaryParagraphs(summary: string) {
  return summary
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseTranscriptLine(line: string) {
  const match = line.match(/^(Hablante \d+):\s*(.*)$/);

  if (!match) {
    return { speaker: null, text: line };
  }

  return { speaker: match[1], text: match[2] };
}

function TaskCard({ task }: { task: ListeningTask }) {
  const priority = PRIORITY_STYLES[task.priority_level] ?? PRIORITY_STYLES.media;
  const deadline = formatDeadline(task.deadline);

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <SymbolView
            name={{ ios: 'checkmark.circle', android: 'task_alt', web: 'task_alt' }}
            tintColor={MemoColors.secondaryBlue}
            size={18}
          />
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor: priority.backgroundColor,
              borderColor: priority.borderColor,
            },
          ]}>
          <Text style={[styles.priorityText, { color: priority.textColor }]}>{priority.label}</Text>
        </View>
      </View>
      <Text style={styles.taskDescription}>{task.description}</Text>
      {deadline ? (
        <View style={styles.deadlineRow}>
          <SymbolView
            name={{ ios: 'calendar', android: 'event', web: 'event' }}
            tintColor="rgba(255,255,255,0.5)"
            size={14}
          />
          <Text style={styles.deadlineText}>{deadline}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function MemoMeetingSummaryContent({
  title,
  aiSummary,
  transcription,
  tasks,
  audioUrl,
  eyebrow = 'Reunion procesada',
  tasksLabel,
  footer,
  scrollable = true,
}: MemoMeetingSummaryContentProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  const summaryParagraphs = useMemo(() => splitSummaryParagraphs(aiSummary), [aiSummary]);

  const transcriptLines = useMemo(
    () => transcription.split('\n').map((line) => line.trim()).filter(Boolean),
    [transcription]
  );

  const resolvedTasksLabel =
    tasksLabel ?? (tasks.length === 1 ? '1 tarea nueva' : `${tasks.length} tareas nuevas`);

  const body = (
    <>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      {audioUrl ? (
        <Suspense
          fallback={
            <View style={styles.audioLoading}>
              <ActivityIndicator color={MemoColors.white} />
            </View>
          }>
          <MemoMeetingAudioPlayer audioUrl={audioUrl} />
        </Suspense>
      ) : null}

      <LinearGradient
        colors={['rgba(35,133,255,0.18)', 'rgba(14,165,233,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}>
        <View style={styles.summaryCardInner}>
          <View style={styles.sectionLabelRow}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
              tintColor={MemoColors.secondaryBlue}
              size={16}
            />
            <Text style={styles.sectionLabel}>Resumen ejecutivo</Text>
          </View>
          {summaryParagraphs.length > 0 ? (
            summaryParagraphs.map((paragraph, index) => (
              <Text key={`${index}-${paragraph.slice(0, 12)}`} style={styles.summaryParagraph}>
                {paragraph}
              </Text>
            ))
          ) : (
            <Text style={styles.summaryParagraph}>Sin resumen generado todavia.</Text>
          )}
        </View>
      </LinearGradient>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={transcriptExpanded ? 'Ocultar transcripcion' : 'Mostrar transcripcion'}
        onPress={() => setTranscriptExpanded((expanded) => !expanded)}
        style={({ pressed }) => [styles.transcriptToggle, pressed && styles.pressed]}>
        <View style={styles.sectionLabelRow}>
          <SymbolView
            name={{ ios: 'text.quote', android: 'format_quote', web: 'format_quote' }}
            tintColor="rgba(255,255,255,0.72)"
            size={16}
          />
          <Text style={styles.sectionLabel}>Transcripcion</Text>
        </View>
        <SymbolView
          name={
            transcriptExpanded
              ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' }
              : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }
          }
          tintColor="rgba(255,255,255,0.6)"
          size={18}
        />
      </Pressable>

      {transcriptExpanded ? (
        <View style={styles.transcriptCard}>
          {transcriptLines.length > 0 ? (
            transcriptLines.map((line, index) => {
              const { speaker, text } = parseTranscriptLine(line);

              return (
                <View key={`${index}-${line.slice(0, 16)}`} style={styles.transcriptLine}>
                  {speaker ? <Text style={styles.speakerLabel}>{speaker}</Text> : null}
                  <Text style={styles.transcriptText}>{text}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.transcriptText}>Sin transcripcion disponible.</Text>
          )}
        </View>
      ) : null}

      {tasks.length > 0 ? (
        <View style={styles.tasksSection}>
          <View style={styles.sectionLabelRow}>
            <SymbolView
              name={{ ios: 'list.bullet.clipboard', android: 'assignment', web: 'assignment' }}
              tintColor="rgba(255,255,255,0.72)"
              size={16}
            />
            <Text style={styles.sectionLabel}>{resolvedTasksLabel}</Text>
          </View>
          {tasks.map((task, index) => (
            <TaskCard key={`${task.title}-${index}`} task={task} />
          ))}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.container}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={styles.staticContent}>{body}</View>
      )}

      {footer}
    </View>
  );
}

export function MemoMeetingSummary({ result, audioUrl, onDone }: MemoMeetingSummaryProps) {
  const { meeting_data: meeting, new_tasks: tasks } = result;

  return (
    <MemoMeetingSummaryContent
      title={meeting.title}
      aiSummary={meeting.ai_summary}
      transcription={meeting.transcription}
      tasks={tasks}
      audioUrl={audioUrl}
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Listo"
          onPress={onDone}
          style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}>
          <Text style={styles.doneButtonText}>Listo</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  staticContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  header: {
    gap: Spacing.one,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: MemoColors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  audioLoading: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74,168,254,0.28)',
    overflow: 'hidden',
  },
  summaryCardInner: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryParagraph: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  transcriptCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  transcriptLine: {
    gap: 4,
  },
  speakerLabel: {
    color: MemoColors.secondaryBlue,
    fontSize: 13,
    fontWeight: '800',
  },
  transcriptText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  tasksSection: {
    gap: Spacing.three,
  },
  taskCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  taskTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  taskTitle: {
    flex: 1,
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  priorityBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskDescription: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  doneButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: MemoColors.white,
    paddingHorizontal: Spacing.four,
  },
  doneButtonText: {
    color: '#03122A',
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
