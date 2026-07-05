import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { Checkbox } from '@/components/checkbox';
import { FilterButton } from '@/components/filter-button';
import { GradientBackground } from '@/components/gradient-background';
import { EmptyState, ErrorBanner, LoadingPanel } from '@/components/list-states';
import { SharedStyles } from '@/constants/shared-styles';
import { Spacing } from '@/constants/theme';
import { fetchTasks, updateTask } from '@/lib/memo-records';
import { MemoTask } from '@/lib/supabase';
import { formatDeadline, isDoneTask, getDeadlineTime, normalizePriority, PRIORITY_WEIGHT } from '@/lib/task-helpers';
import { useAuth } from '@/providers/auth-provider';

type TaskFilter = 'active' | 'done' | 'all';
type TaskSort = 'deadline' | 'priority';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

function matchesTaskSearch(task: MemoTask, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [task.title, task.description, task.priority_level, task.deadline]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

export default function TasksScreen() {
  const { profile } = useAuth();
  const profileId = profile?.profile_id ?? null;
  const [tasks, setTasks] = useState<MemoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('active');
  const [sortBy, setSortBy] = useState<TaskSort>('deadline');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const doneCount = useMemo(() => tasks.filter(isDoneTask).length, [tasks]);
  const activeCount = tasks.length - doneCount;

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') {
          return !isDoneTask(task);
        }

        if (filter === 'done') {
          return isDoneTask(task);
        }

        return true;
      })
      .filter((task) => matchesTaskSearch(task, searchQuery))
      .sort((firstTask, secondTask) => {
        if (sortBy === 'priority') {
          const priorityDelta =
            PRIORITY_WEIGHT[normalizePriority(firstTask.priority_level)] -
            PRIORITY_WEIGHT[normalizePriority(secondTask.priority_level)];

          if (priorityDelta !== 0) {
            return priorityDelta;
          }
        }

        return getDeadlineTime(firstTask) - getDeadlineTime(secondTask);
      });
  }, [filter, searchQuery, sortBy, tasks]);

  const loadTasks = useCallback(async () => {
    if (!profileId) {
      setTasks([]);
      return;
    }

    setErrorMessage(null);

    try {
      const nextTasks = await fetchTasks(profileId);
      setTasks(nextTasks);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      loadTasks().finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [loadTasks])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  const toggleTaskDone = useCallback(async (task: MemoTask) => {
    setTogglingTaskId(task.task_id);
    setErrorMessage(null);

    try {
      const updatedTask = await updateTask(task.task_id, {
        title: task.title ?? '',
        description: task.description ?? '',
        priority_level: normalizePriority(task.priority_level),
        status: isDoneTask(task) ? 'pending' : 'done',
        deadline: task.deadline,
      });

      setTasks((currentTasks) =>
        currentTasks.map((item) => (item.task_id === updatedTask.task_id ? updatedTask : item))
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setTogglingTaskId(null);
    }
  }, []);

  return (
    <GradientBackground>
      <ScrollView
        style={SharedStyles.scroll}
        contentContainerStyle={SharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={MemoColors.secondaryBlue} />}>
        <SafeAreaView style={[SharedStyles.safeArea, { gap: Spacing.five }]}>
          <Animated.View entering={FadeInDown.duration(520).delay(80)} style={SharedStyles.header}>
            <Text style={SharedStyles.eyebrow}>Tareas</Text>
            <Text style={SharedStyles.title}>Tus compromisos personales</Text>
            <Text style={SharedStyles.subtitle}>
              {tasks.length > 0
                ? `${activeCount} por hacer. ${doneCount} realizadas.`
                : 'Las tareas detectadas en reuniones apareceran aqui. Solo tu puedes verlas y gestionarlas.'}
            </Text>
          </Animated.View>

          <View style={SharedStyles.controls}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar task"
              placeholderTextColor="rgba(255,255,255,0.36)"
              style={SharedStyles.searchInput}
            />
            <View style={SharedStyles.segmentedControl}>
              <FilterButton label="Activas" active={filter === 'active'} onPress={() => setFilter('active')} />
              <FilterButton label="Realizadas" active={filter === 'done'} onPress={() => setFilter('done')} />
              <FilterButton label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
            </View>
            <View style={SharedStyles.segmentedControl}>
              <FilterButton label="Deadline" active={sortBy === 'deadline'} onPress={() => setSortBy('deadline')} />
              <FilterButton label="Prioridad" active={sortBy === 'priority'} onPress={() => setSortBy('priority')} />
            </View>
          </View>

          <ErrorBanner message={errorMessage} />

          {loading ? (
            <LoadingPanel message="Cargando tareas..." />
          ) : visibleTasks.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(520).delay(180)}>
              <EmptyState
                title="No hay tareas para este filtro"
                text="Ajusta la busqueda, cambia el estado o revisa el orden seleccionado."
              />
            </Animated.View>
          ) : (
            <View style={SharedStyles.list}>
              {visibleTasks.map((task, index) => {
                const done = isDoneTask(task);
                const isToggling = togglingTaskId === task.task_id;

                return (
                  <Animated.View
                    key={task.task_id}
                    entering={FadeInDown.duration(440).delay(120 + index * 50)}>
                    <Pressable
                      onPress={() => router.push(`/tasks/${task.task_id}`)}
                      style={({ pressed }) => [SharedStyles.card, pressed && SharedStyles.cardPressed]}>
                      <View style={SharedStyles.cardHeader}>
                        <Checkbox checked={done} disabled={isToggling} onPress={() => toggleTaskDone(task)} />
                        <View style={SharedStyles.cardTitleGroup}>
                          <Text style={SharedStyles.cardTitle} numberOfLines={1}>
                            {task.title ?? 'Tarea sin titulo'}
                          </Text>
                          <Text style={SharedStyles.cardMeta}>{normalizePriority(task.priority_level).toUpperCase()}</Text>
                        </View>
                        {task.deadline ? <Text style={SharedStyles.datePill}>{formatDeadline(task.deadline)}</Text> : null}
                      </View>
                      <Text style={SharedStyles.cardDescription} numberOfLines={2}>
                        {task.description || 'Sin descripcion registrada.'}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
