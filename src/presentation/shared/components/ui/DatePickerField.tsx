import React, { useState, useCallback } from 'react';
import { View, Modal, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

interface SpinnerColumnProps {
  inputValue: string;
  displayValue: string;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  maxLength: number;
}

function SpinnerColumn({ inputValue, displayValue, label, onDecrement, onIncrement, onChangeText, onBlur, maxLength }: SpinnerColumnProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <AppText style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </AppText>
      <Pressable
        onPress={onDecrement}
        style={{ padding: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
      >
        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.neonPurple} />
      </Pressable>
      <View style={{
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: focused ? colors.neonPurple : 'rgba(168,85,247,0.5)',
        minWidth: 60,
        alignItems: 'center',
      }}>
        <TextInput
          value={focused ? inputValue : displayValue}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur(); }}
          keyboardType="number-pad"
          maxLength={maxLength}
          textAlign="center"
          selectTextOnFocus
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: theme.text,
            paddingHorizontal: 10,
            paddingVertical: 10,
            width: '100%',
          }}
          accessibilityLabel={label}
        />
      </View>
      <Pressable
        onPress={onIncrement}
        style={{ padding: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
      >
        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.neonPurple} />
      </Pressable>
    </View>
  );
}

export function DatePickerField({ value, onChange, placeholder, disabled, accessibilityLabel }: DatePickerFieldProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [day, setDay] = useState(value?.getDate() ?? 1);
  const [month, setMonth] = useState((value?.getMonth() ?? 0) + 1);
  const [year, setYear] = useState(value?.getFullYear() ?? CURRENT_YEAR - 20);

  // Raw text strings while user types
  const [dayText, setDayText] = useState('');
  const [monthText, setMonthText] = useState('');
  const [yearText, setYearText] = useState('');

  const monthShort = useCallback(
    (m: number) => new Date(2000, m - 1, 1).toLocaleDateString(i18n.language, { month: 'short' }),
    [i18n.language],
  );

  const formatDate = useCallback(
    (d: Date) => {
      const dy = String(d.getDate()).padStart(2, '0');
      const mo = new Date(2000, d.getMonth(), 1).toLocaleDateString(i18n.language, { month: 'short' });
      return `${dy} ${mo} ${d.getFullYear()}`;
    },
    [i18n.language],
  );

  const handleOpen = useCallback(() => {
    const d = value ?? new Date(CURRENT_YEAR - 20, 0, 1);
    setDay(d.getDate());
    setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setDayText('');
    setMonthText('');
    setYearText('');
    setModalVisible(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    const maxDay = daysInMonth(month, year);
    const validDay = clamp(day, 1, maxDay);
    onChange(new Date(year, month - 1, validDay));
    setModalVisible(false);
  }, [day, month, year, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setModalVisible(false);
  }, [onChange]);

  // Day
  const adjustDay = useCallback((delta: number) => {
    setDay(prev => {
      const maxDay = daysInMonth(month, year);
      const next = prev + delta;
      if (next < 1) return maxDay;
      if (next > maxDay) return 1;
      return next;
    });
  }, [month, year]);

  const handleDayText = useCallback((text: string) => {
    setDayText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 31) setDay(num);
  }, []);

  const handleDayBlur = useCallback(() => {
    setDay(prev => clamp(prev, 1, daysInMonth(month, year)));
    setDayText('');
  }, [month, year]);

  // Month
  const adjustMonth = useCallback((delta: number) => {
    setMonth(prev => {
      const next = prev + delta;
      if (next < 1) return 12;
      if (next > 12) return 1;
      return next;
    });
  }, []);

  const handleMonthText = useCallback((text: string) => {
    setMonthText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) setMonth(num);
  }, []);

  const handleMonthBlur = useCallback(() => {
    setMonth(prev => clamp(prev, 1, 12));
    setMonthText('');
  }, []);

  // Year
  const adjustYear = useCallback((delta: number) => {
    setYear(prev => clamp(prev + delta, MIN_YEAR, CURRENT_YEAR));
  }, []);

  const handleYearText = useCallback((text: string) => {
    setYearText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= MIN_YEAR && num <= CURRENT_YEAR) setYear(num);
  }, []);

  const handleYearBlur = useCallback(() => {
    setYear(prev => clamp(prev, MIN_YEAR, CURRENT_YEAR));
    setYearText('');
  }, []);

  return (
    <View>
      <Pressable
        onPress={() => !disabled && handleOpen()}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: 'transparent',
          paddingHorizontal: 16,
          gap: 10,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <MaterialCommunityIcons
          name="cake-variant-outline"
          size={18}
          color={value ? colors.neonPurple : theme.textMuted}
        />
        <AppText style={{ flex: 1, fontSize: 15, color: value ? theme.text : theme.textMuted }}>
          {value ? formatDate(value) : placeholder}
        </AppText>
        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.textMuted} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
              borderTopWidth: 1,
              borderColor: theme.border,
            }}
          >
            <AppText style={{
              fontSize: 17,
              fontWeight: '700',
              color: theme.text,
              textAlign: 'center',
              marginBottom: 28,
            }}>
              {placeholder ?? t('personalInfo.birthday')}
            </AppText>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
              <SpinnerColumn
                inputValue={dayText}
                displayValue={String(day).padStart(2, '0')}
                label={t('common.date.day')}
                onDecrement={() => adjustDay(-1)}
                onIncrement={() => adjustDay(1)}
                onChangeText={handleDayText}
                onBlur={handleDayBlur}
                maxLength={2}
              />
              <SpinnerColumn
                inputValue={monthText}
                displayValue={monthShort(month)}
                label={t('common.date.month')}
                onDecrement={() => adjustMonth(-1)}
                onIncrement={() => adjustMonth(1)}
                onChangeText={handleMonthText}
                onBlur={handleMonthBlur}
                maxLength={2}
              />
              <SpinnerColumn
                inputValue={yearText}
                displayValue={String(year)}
                label={t('common.date.year')}
                onDecrement={() => adjustYear(-1)}
                onIncrement={() => adjustYear(1)}
                onChangeText={handleYearText}
                onBlur={handleYearBlur}
                maxLength={4}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AppButton
                variant="secondary"
                size="lg"
                onPress={handleClear}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                {t('common.cancel')}
              </AppButton>
              <AppButton
                variant="primary"
                size="lg"
                onPress={handleConfirm}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.confirm')}
              >
                {t('common.confirm')}
              </AppButton>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
