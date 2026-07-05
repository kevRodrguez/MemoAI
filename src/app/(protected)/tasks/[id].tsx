import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { ActionButton, ActionRow } from '@/components/action-button';
import { BackButton } from '@/components/back-button';
import { Checkbox } from '@/components/checkbox';
import { DateTimeField } from '@/components/date-time-field';
import { DetailItem } from '@/components/detail-item';
import { FormInput } from '@/components/form-input';
import { GradientBackground } from '@/components/gradient-background';
import { EmptyState, ErrorBanner, LoadingPanel } from '@/components/list-states';
import { SharedStyles } from '@/constants/shared-styles';
import { Spacing } from '@/constants/theme';
import { deleteTask, fetchTaskById, updateTask } from '@/lib/memo-records';
import { MemoTask } from '@/lib/supabase';
import { formatDeadline, isDoneTask, normalizePriority, PRIORITY_OPTIONS } from '@/lib/task-helpers';

type TaskDraft = {
  title: string;
  description: string;
  priority_level: string;
  deadline: string;
  done: boolean;
};

function getTaskDraft(task: MemoTask): TaskDraft {
  return {
    title: task.title ?? '',
    description: task.description ?? '',
    priority_level: normalizePriority(task.priority_level),
    deadline: task.deadline ?? '',
    done: isDoneTask(task),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<MemoTask | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    fetchTaskById(id)
      .then((nextTask) => {
        if (isMounted) {
          setTask(nextTask);
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
    if (!task) {
      return;
    }
    setDraft(getTaskDraft(task));
    setIsEditing(true);
  }, [task]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraft(null);
  }, []);

  const saveTask = useCallback(async () => {
    if (!task || !draft) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const updatedTask = await updateTask(task.task_id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority_level: normalizePriority(draft.priority_level),
        status: draft.done ? 'done' : 'pending',
        deadline: draft.deadline.trim() || null,
      });

      setTask(updatedTask);
      cancelEditing();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }, [cancelEditing, draft, task]);

  const toggleTaskDone = useCallback(async () => {
    if (!task) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const updatedTask = await updateTask(task.task_id, {
        title: task.title ?? '',
        description: task.description ?? '',
        priority_level: normalizePriority(task.priority_level),
        status: isDoneTask(task) ? 'pending' : 'done',
        deadline: task.deadline,
      });

      setTask(updatedTask);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }, [task]);

  const confirmDelete = useCallback(() => {
    if (!task) {
      return;
    }

    Alert.alert('Eliminar tarea', `Eliminar "${task.title ?? 'esta tarea'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          setErrorMessage(null);

          try {
            await deleteTask(task.task_id);
            router.back();
          } catch (error) {
            setErrorMessage(getErrorMessage(error));
            setSaving(false);
          }
        },
      },
    ]);
  }, [task]);

  return (
    <GradientBackground>
      <ScrollView style={SharedStyles.scroll} contentContainerStyle={SharedStyles.content}>
        <SafeAreaView style={SharedStyles.safeArea}>
          <BackButton onPress={() => router.back()} />

          <ErrorBanner message={errorMessage} />

          {loading ? (
            <LoadingPanel message="Cargando tarea..." />
          ) : !task ? (
            <EmptyState title="No se encontro la tarea" />
          ) : isEditing && draft ? (
            <Animated.View entering={FadeInDown.duration(420)} style={SharedStyles.card}>
              <View style={SharedStyles.form}>
                <FormInput
                  label="Titulo"
                  value={draft.title}
                  onChangeText={(title) => setDraft((current) => current && { ...current, title })}
                />
                <FormInput
                  label="Descripcion"
                  value={draft.description}
                  multiline
                  onChangeText={(description) => setDraft((current) => current && { ...current, description })}
                />
                <View style={styles.checkboxRow}>
                  <Checkbox
                    checked={draft.done}
                    onPress={() => setDraft((current) => current && { ...current, done: !current.done })}
                  />
                  <Text style={styles.checkboxLabel}>{draft.done ? 'Completada' : 'Pendiente'}</Text>
                </View>
                <OptionGroup
                  label="Prioridad"
                  options={PRIORITY_OPTIONS}
                  value={draft.priority_level}
                  onChange={(priority_level) => setDraft((current) => current && { ...current, priority_level })}
                />
                <DateTimeField
                  label="Deadline"
                  mode="date"
                  value={draft.deadline || null}
                  formatValue={formatDeadline}
                  onClear={() => setDraft((current) => current && { ...current, deadline: '' })}
                  onChange={(deadline) => setDraft((current) => current && { ...current, deadline })}
                />
                <ActionRow>
                  <ActionButton label="Cancelar" variant="secondary" onPress={cancelEditing} disabled={saving} />
                  <ActionButton label={saving ? 'Guardando...' : 'Guardar'} onPress={saveTask} disabled={saving} />
                </ActionRow>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(420)} style={SharedStyles.card}>
              <View style={SharedStyles.cardHeader}>
                <Checkbox checked={isDoneTask(task)} disabled={saving} onPress={toggleTaskDone} />
                <View style={SharedStyles.cardTitleGroup}>
                  <Text style={[SharedStyles.cardTitle, SharedStyles.detailCardTitle]}>
                    {task.title ?? 'Tarea sin titulo'}
                  </Text>
                  <Text style={SharedStyles.cardMeta}>
                    {isDoneTask(task) ? 'Completada' : 'Pendiente'} - {normalizePriority(task.priority_level).toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={SharedStyles.cardDescription}>{task.description || 'Sin descripcion registrada.'}</Text>

              <View style={SharedStyles.detailGrid}>
                <DetailItem label="Deadline" value={formatDeadline(task.deadline)} />
                <DetailItem label="Prioridad" value={normalizePriority(task.priority_level).toUpperCase()} />
              </View>

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

function OptionGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly TValue[];
  value: string;
  onChange: (value: TValue) => void;
}) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const active = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.optionButton, active && styles.optionButtonActive]}>
              <Text style={[styles.optionButtonText, active && styles.optionButtonTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkboxLabel: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  optionGroup: {
    gap: Spacing.two,
  },
  optionLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  optionButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.two,
  },
  optionButtonActive: {
    borderColor: 'rgba(74,168,254,0.50)',
    backgroundColor: 'rgba(74,168,254,0.18)',
  },
  optionButtonText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    fontWeight: '800',
  },
  optionButtonTextActive: {
    color: MemoColors.white,
  },
});
