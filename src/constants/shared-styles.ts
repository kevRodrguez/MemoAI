import { StyleSheet } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { BottomTabInset, Spacing } from '@/constants/theme';

/**
 * Styles reused across the meetings and tasks list/detail screens so the two
 * feature areas stay visually consistent without duplicating StyleSheet objects.
 */
export const SharedStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: BottomTabInset + Spacing.five,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.three,
  },
  eyebrow: {
    color: MemoColors.secondaryBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: MemoColors.white,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 16,
    lineHeight: 23,
  },
  controls: {
    gap: Spacing.three,
  },
  searchInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: MemoColors.white,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  form: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    backgroundColor: 'rgba(4,10,26,0.72)',
    padding: Spacing.four,
  },
  cardPressed: {
    opacity: 0.72,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  cardTitleGroup: {
    flex: 1,
    gap: Spacing.one,
  },
  cardTitle: {
    color: MemoColors.white,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  detailCardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  cardMeta: {
    color: MemoColors.secondaryBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
  },
  datePill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(74,168,254,0.13)',
    color: MemoColors.white,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 148,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
