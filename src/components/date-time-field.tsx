import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MemoColors } from '@/assets/colors';
import { Spacing } from '@/constants/theme';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const MINUTE_STEP = 5;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateOnlyIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function buildCalendarCells(viewYear: number, viewMonth: number) {
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const leadingBlanks = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  return cells;
}

function parseValue(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

type DateTimeFieldProps = {
  label: string;
  value: string | null;
  onChange: (nextValue: string) => void;
  onClear?: () => void;
  mode?: 'date' | 'datetime';
  formatValue: (value: string) => string;
  placeholder?: string;
};

export function DateTimeField({
  label,
  value,
  onChange,
  onClear,
  mode = 'datetime',
  formatValue,
  placeholder = 'Sin fecha',
}: DateTimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  const openPicker = () => {
    const base = parseValue(value) ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setSelectedDay(parseValue(value) ? base.getDate() : null);
    setHour(parseValue(value) ? base.getHours() : 9);
    setMinute(parseValue(value) ? base.getMinutes() : 0);
    setIsOpen(true);
  };

  const goToPreviousMonth = () => {
    setViewMonth((currentMonth) => {
      if (currentMonth === 0) {
        setViewYear((currentYear) => currentYear - 1);
        return 11;
      }
      return currentMonth - 1;
    });
  };

  const goToNextMonth = () => {
    setViewMonth((currentMonth) => {
      if (currentMonth === 11) {
        setViewYear((currentYear) => currentYear + 1);
        return 0;
      }
      return currentMonth + 1;
    });
  };

  const adjustHour = (delta: number) => {
    setHour((currentHour) => (currentHour + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinute((currentMinute) => (currentMinute + delta + 60) % 60);
  };

  const confirmSelection = () => {
    if (selectedDay == null) {
      setIsOpen(false);
      return;
    }

    if (mode === 'date') {
      onChange(toDateOnlyIso(viewYear, viewMonth, selectedDay));
    } else {
      onChange(new Date(viewYear, viewMonth, selectedDay, hour, minute).toISOString());
    }

    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedDay(null);
    onClear?.();
    setIsOpen(false);
  };

  const cells = buildCalendarCells(viewYear, viewMonth);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={styles.trigger}>
        <Text style={styles.triggerText}>{value ? formatValue(value) : placeholder}</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.monthHeader}>
              <Pressable onPress={goToPreviousMonth} style={styles.monthNavButton}>
                <Text style={styles.monthNavText}>{'‹'}</Text>
              </Pressable>
              <Text style={styles.monthLabel}>{`${MONTH_LABELS[viewMonth]} ${viewYear}`}</Text>
              <Pressable onPress={goToNextMonth} style={styles.monthNavButton}>
                <Text style={styles.monthNavText}>{'›'}</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((weekday) => (
                <Text key={weekday} style={styles.weekdayText}>{weekday}</Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {cells.map((day, index) => {
                if (day == null) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                const active = selectedDay === day;

                return (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[styles.dayCell, active && styles.dayCellActive]}>
                    <Text style={[styles.dayCellText, active && styles.dayCellTextActive]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'datetime' ? (
              <View style={styles.timeRow}>
                <Text style={styles.label}>Hora</Text>
                <View style={styles.timeControls}>
                  <TimeStepper value={pad(hour)} onDecrease={() => adjustHour(-1)} onIncrease={() => adjustHour(1)} />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TimeStepper
                    value={pad(minute)}
                    onDecrease={() => adjustMinute(-MINUTE_STEP)}
                    onIncrease={() => adjustMinute(MINUTE_STEP)}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.sheetActions}>
              {onClear ? (
                <Pressable onPress={clearSelection} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Quitar</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => setIsOpen(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={confirmSelection} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Listo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimeStepper({ value, onDecrease, onIncrease }: { value: string; onDecrease: () => void; onIncrease: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDecrease} style={styles.stepperButton}>
        <Text style={styles.stepperButtonText}>{'-'}</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable onPress={onIncrease} style={styles.stepperButton}>
        <Text style={styles.stepperButtonText}>{'+'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    fontWeight: '800',
  },
  trigger: {
    minHeight: 46,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
  },
  triggerText: {
    color: MemoColors.white,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,5,14,0.72)',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    backgroundColor: '#0a1226',
    padding: Spacing.four,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  monthNavText: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  monthLabel: {
    color: MemoColors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.44)',
    fontSize: 12,
    fontWeight: '800',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellActive: {
    borderRadius: 999,
    backgroundColor: 'rgba(74,168,254,0.30)',
  },
  dayCellText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '600',
  },
  dayCellTextActive: {
    color: MemoColors.white,
    fontWeight: '800',
  },
  timeRow: {
    gap: Spacing.two,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  timeSeparator: {
    color: MemoColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  stepperButtonText: {
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  stepperValue: {
    minWidth: 32,
    textAlign: 'center',
    color: MemoColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  clearButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,77,109,0.42)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,77,109,0.14)',
  },
  clearButtonText: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: MemoColors.secondaryBlue,
  },
  confirmButtonText: {
    color: MemoColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
