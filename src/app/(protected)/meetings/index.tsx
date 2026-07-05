import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemoColors } from '@/assets/colors';
import { EmptyState, ErrorBanner, LoadingPanel } from '@/components/list-states';
import { FilterButton } from '@/components/filter-button';
import { GradientBackground } from '@/components/gradient-background';
import { SharedStyles } from '@/constants/shared-styles';
import { Spacing } from '@/constants/theme';
import { fetchMeetings } from '@/lib/memo-records';
import { formatMeetingDate, isPastMeeting } from '@/lib/meeting-helpers';
import { MemoMeeting } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type MeetingFilter = 'upcoming' | 'past' | 'all';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

function matchesMeetingSearch(meeting: MemoMeeting, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [meeting.title, meeting.ai_summary, meeting.transcription, formatMeetingDate(meeting.date_time)]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

export default function MeetingsScreen() {
  const { profile } = useAuth();
  const profileId = profile?.profile_id ?? null;
  const [meetings, setMeetings] = useState<MemoMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<MeetingFilter>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const upcomingCount = useMemo(() => meetings.filter((meeting) => !isPastMeeting(meeting)).length, [meetings]);
  const pastCount = useMemo(() => meetings.filter(isPastMeeting).length, [meetings]);

  const visibleMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => {
        if (filter === 'upcoming') {
          return !isPastMeeting(meeting);
        }

        if (filter === 'past') {
          return isPastMeeting(meeting);
        }

        return true;
      })
      .filter((meeting) => matchesMeetingSearch(meeting, searchQuery));
  }, [filter, meetings, searchQuery]);

  const loadMeetings = useCallback(async () => {
    if (!profileId) {
      setMeetings([]);
      return;
    }

    setErrorMessage(null);

    try {
      const nextMeetings = await fetchMeetings(profileId);
      setMeetings(nextMeetings);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      loadMeetings().finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [loadMeetings])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMeetings();
    } finally {
      setRefreshing(false);
    }
  }, [loadMeetings]);

  return (
    <GradientBackground>
      <ScrollView
        style={SharedStyles.scroll}
        contentContainerStyle={SharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={MemoColors.secondaryBlue} />}>
        <SafeAreaView style={[SharedStyles.safeArea, { gap: Spacing.five }]}>
          <Animated.View entering={FadeInDown.duration(520).delay(80)} style={SharedStyles.header}>
            <Text style={SharedStyles.eyebrow}>Reuniones</Text>
            <Text style={SharedStyles.title}>Tus meetings recientes</Text>
            <Text style={SharedStyles.subtitle}>
              {meetings.length > 0
                ? `${upcomingCount} agendadas y ${pastCount} pasadas guardadas en Supabase.`
                : 'Aqui apareceran las reuniones capturadas, con fecha, transcripcion y resumen cuando aplique.'}
            </Text>
          </Animated.View>

          <View style={SharedStyles.controls}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar meeting"
              placeholderTextColor="rgba(255,255,255,0.36)"
              style={SharedStyles.searchInput}
            />
            <View style={SharedStyles.segmentedControl}>
              <FilterButton label="Agendadas" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
              <FilterButton label="Pasadas" active={filter === 'past'} onPress={() => setFilter('past')} />
              <FilterButton label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
            </View>
          </View>

          <ErrorBanner message={errorMessage} />

          {loading ? (
            <LoadingPanel message="Cargando meetings..." />
          ) : visibleMeetings.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(520).delay(180)}>
              <EmptyState
                title="No hay meetings para este filtro"
                text="Ajusta la busqueda o cambia entre agendadas y pasadas."
              />
            </Animated.View>
          ) : (
            <View style={SharedStyles.list}>
              {visibleMeetings.map((meeting, index) => {
                const canShowContent = isPastMeeting(meeting);

                return (
                  <Animated.View
                    key={meeting.meeting_id}
                    entering={FadeInDown.duration(440).delay(120 + index * 50)}>
                    <Pressable
                      onPress={() => router.push(`/meetings/${meeting.meeting_id}`)}
                      style={({ pressed }) => [SharedStyles.card, pressed && SharedStyles.cardPressed]}>
                      <View style={SharedStyles.cardHeader}>
                        <View style={SharedStyles.cardTitleGroup}>
                          <Text style={SharedStyles.cardTitle} numberOfLines={1}>
                            {meeting.title ?? 'Meeting sin titulo'}
                          </Text>
                          <Text style={SharedStyles.cardMeta}>{canShowContent ? 'Pasada' : 'Agendada'}</Text>
                        </View>
                        <Text style={SharedStyles.datePill}>{formatMeetingDate(meeting.date_time)}</Text>
                      </View>
                      <Text style={SharedStyles.cardDescription} numberOfLines={2}>
                        {canShowContent
                          ? meeting.ai_summary || 'Sin resumen generado todavia.'
                          : 'Reunion agendada. Toca para ver mas detalles.'}
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
