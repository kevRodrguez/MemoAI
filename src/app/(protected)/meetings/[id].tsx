import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton, ActionRow } from '@/components/action-button';
import { BackButton } from '@/components/back-button';
import { DateTimeField } from '@/components/date-time-field';
import { FormInput } from '@/components/form-input';
import { GradientBackground } from '@/components/gradient-background';
import { EmptyState, ErrorBanner, LoadingPanel } from '@/components/list-states';
import { MemoMeetingSummaryContent } from '@/components/memo-meeting-summary';
import { SharedStyles } from '@/constants/shared-styles';
import { Spacing } from '@/constants/theme';
import { deleteMeeting, fetchMeetingById, fetchTasksByMeetingId, updateMeeting } from '@/lib/memo-records';
import { canShowMeetingContent, formatMeetingDate, isPastMeeting } from '@/lib/meeting-helpers';
import { mapMemoTaskToSummaryTask } from '@/lib/meeting-summary';
import { getRecordingPublicUrl } from '@/lib/recording-url';
import { MemoMeeting, MemoTask } from '@/lib/supabase';

type MeetingDraft = {
  title: string;
  date_time: string;
  duration: string;
  transcription: string;
  ai_summary: string;
};

function getMeetingDraft(meeting: MemoMeeting): MeetingDraft {
  return {
    title: meeting.title ?? '',
    date_time: meeting.date_time ?? '',
    duration: meeting.duration === null ? '' : String(meeting.duration),
    transcription: meeting.transcription ?? '',
    ai_summary: meeting.ai_summary ?? '',
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meeting, setMeeting] = useState<MemoMeeting | null>(null);
  const [tasks, setTasks] = useState<MemoTask[]>([]);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<MeetingDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    Promise.all([fetchMeetingById(id), fetchTasksByMeetingId(id)])
      .then(([nextMeeting, nextTasks]) => {
        if (isMounted) {
          setMeeting(nextMeeting);
          setTasks(nextTasks);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const startEditing = useCallback(() => {
    if (!meeting) {
      return;
    }
    setDraft(getMeetingDraft(meeting));
    setIsEditing(true);
  }, [meeting]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraft(null);
  }, []);

  const saveMeeting = useCallback(async () => {
    if (!meeting || !draft) {
      return;
    }

    const canEditContent = canShowMeetingContent(meeting);
    setSaving(true);
    setErrorMessage(null);

    try {
      const updatedMeeting = await updateMeeting(meeting.meeting_id, {
        title: draft.title.trim(),
        date_time: draft.date_time.trim() || null,
        duration: draft.duration.trim() ? Number(draft.duration) : null,
        ...(canEditContent
          ? {
              transcription: draft.transcription.trim() || null,
              ai_summary: draft.ai_summary.trim() || null,
            }
          : {}),
      });

      setMeeting(updatedMeeting);
      cancelEditing();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }, [cancelEditing, draft, meeting]);

  const confirmDelete = useCallback(() => {
    if (!meeting) {
      return;
    }

    Alert.alert('Eliminar meeting', `Eliminar "${meeting.title ?? 'este meeting'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          setErrorMessage(null);

          try {
            await deleteMeeting(meeting.meeting_id);
            router.back();
          } catch (error) {
            setErrorMessage(getErrorMessage(error));
            setSaving(false);
          }
        },
      },
    ]);
  }, [meeting]);

  const summaryTasks = useMemo(() => tasks.map(mapMemoTaskToSummaryTask), [tasks]);
  const audioUrl = useMemo(() => getRecordingPublicUrl(meeting?.audio_path), [meeting?.audio_path]);
  const canShowContent = meeting ? canShowMeetingContent(meeting) : false;

  return (
    <GradientBackground>
      <ScrollView style={SharedStyles.scroll} contentContainerStyle={SharedStyles.content}>
        <SafeAreaView style={SharedStyles.safeArea}>
          <BackButton onPress={() => router.back()} />

          <ErrorBanner message={errorMessage} />

          {loading ? (
            <LoadingPanel message="Cargando meeting..." />
          ) : !meeting ? (
            <EmptyState title="No se encontro el meeting" />
          ) : isEditing && draft ? (
            <Animated.View entering={FadeInDown.duration(420)} style={SharedStyles.card}>
              <View style={SharedStyles.form}>
                <FormInput
                  label="Titulo"
                  value={draft.title}
                  onChangeText={(title) => setDraft((current) => current && { ...current, title })}
                />
                <View style={styles.twoColumn}>
                  <View style={styles.flexColumn}>
                    <DateTimeField
                      label="Fecha"
                      mode="datetime"
                      value={draft.date_time || null}
                      formatValue={formatMeetingDate}
                      onChange={(date_time) => setDraft((current) => current && { ...current, date_time })}
                    />
                  </View>
                  <View style={styles.flexColumn}>
                    <FormInput
                      label="Duracion (min)"
                      value={draft.duration}
                      keyboardType="number-pad"
                      onChangeText={(duration) => setDraft((current) => current && { ...current, duration })}
                    />
                  </View>
                </View>
                {canShowContent ? (
                  <>
                    <FormInput
                      label="Resumen"
                      value={draft.ai_summary}
                      multiline
                      onChangeText={(ai_summary) => setDraft((current) => current && { ...current, ai_summary })}
                    />
                    <FormInput
                      label="Transcripcion"
                      value={draft.transcription}
                      multiline
                      onChangeText={(transcription) =>
                        setDraft((current) => current && { ...current, transcription })
                      }
                    />
                  </>
                ) : null}
                <ActionRow>
                  <ActionButton label="Cancelar" variant="secondary" onPress={cancelEditing} disabled={saving} />
                  <ActionButton label={saving ? 'Guardando...' : 'Guardar'} onPress={saveMeeting} disabled={saving} />
                </ActionRow>
              </View>
            </Animated.View>
          ) : canShowContent ? (
            <Animated.View entering={FadeInDown.duration(420)} style={styles.summaryShell}>
              <MemoMeetingSummaryContent
                scrollable={false}
                eyebrow={isPastMeeting(meeting) ? 'Reunion pasada' : 'Reunion procesada'}
                title={meeting.title ?? 'Meeting sin titulo'}
                aiSummary={meeting.ai_summary ?? ''}
                transcription={meeting.transcription ?? ''}
                tasks={summaryTasks}
                tasksLabel={
                  summaryTasks.length === 1
                    ? '1 tarea vinculada'
                    : `${summaryTasks.length} tareas vinculadas`
                }
                audioUrl={audioUrl}
                footer={
                  <ActionRow>
                    <ActionButton label="Editar" variant="secondary" onPress={startEditing} disabled={saving} />
                    <ActionButton
                      label={saving ? 'Eliminando...' : 'Eliminar'}
                      variant="danger"
                      onPress={confirmDelete}
                      disabled={saving}
                    />
                  </ActionRow>
                }
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(420)} style={SharedStyles.card}>
              <View style={SharedStyles.cardHeader}>
                <View style={SharedStyles.cardTitleGroup}>
                  <Text style={[SharedStyles.cardTitle, SharedStyles.detailCardTitle]}>
                    {meeting.title ?? 'Meeting sin titulo'}
                  </Text>
                  <Text style={SharedStyles.cardMeta}>Agendada</Text>
                </View>
              </View>

              <Text style={SharedStyles.cardDescription}>
                Reunion agendada para {formatMeetingDate(meeting.date_time)}. El resumen, la transcripcion y el audio se
                mostraran cuando la reunion haya sido procesada.
              </Text>

              <ActionRow>
                <ActionButton label="Editar" variant="secondary" onPress={startEditing} disabled={saving} />
                <ActionButton label={saving ? 'Eliminando...' : 'Eliminar'} variant="danger" onPress={confirmDelete} disabled={saving} />
              </ActionRow>
            </Animated.View>
          )}
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  twoColumn: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flexColumn: {
    flex: 1,
  },
  summaryShell: {
    gap: Spacing.three,
  },
});
