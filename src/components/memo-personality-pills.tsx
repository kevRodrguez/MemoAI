import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { MemoColors } from '@/assets/colors';
import type { MemoPersonality } from '@/types/memo';

type PersonalityOption = {
  value: MemoPersonality;
  label: string;
};

const PERSONALITY_OPTIONS: PersonalityOption[] = [
  { value: 'executive', label: 'Executive' },
  { value: 'technical', label: 'Technical' },
  { value: 'casual', label: 'Casual' },
  { value: 'teammate', label: 'Teammate' },
];

type MemoPersonalityPillsProps = {
  value: MemoPersonality;
  onChange: (personality: MemoPersonality) => void;
};

export function MemoPersonalityPills({ value, onChange }: MemoPersonalityPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}>
      {PERSONALITY_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && styles.pillPressed,
            ]}>
            <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    borderColor: 'rgba(74,168,254,0.72)',
    backgroundColor: 'rgba(35,133,255,0.22)',
  },
  pillPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  pillLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: MemoColors.white,
    fontWeight: '700',
  },
});
