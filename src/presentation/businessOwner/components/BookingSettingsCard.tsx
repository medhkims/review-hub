import React, { useState, useCallback } from 'react';
import { View, Pressable, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { SectionCard } from '@/presentation/businessDetail/components/SectionCard';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BookingConfigEntity, TimeSlot } from '@/domain/booking/entities/bookingConfigEntity';

interface BookingSettingsCardProps {
  config: BookingConfigEntity | null;
  isEditMode: boolean;
  onSaveConfig: (config: BookingConfigEntity) => void;
  onViewRequests: () => void;
}

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const DEFAULT_SLOTS: TimeSlot[] = [
  { start: '09:00', end: '09:30' },
  { start: '09:30', end: '10:00' },
  { start: '10:00', end: '10:30' },
  { start: '10:30', end: '11:00' },
  { start: '11:00', end: '11:30' },
  { start: '11:30', end: '12:00' },
  { start: '14:00', end: '14:30' },
  { start: '14:30', end: '15:00' },
  { start: '15:00', end: '15:30' },
  { start: '15:30', end: '16:00' },
  { start: '16:00', end: '16:30' },
  { start: '16:30', end: '17:00' },
];

export const BookingSettingsCard: React.FC<BookingSettingsCardProps> = ({
  config,
  isEditMode,
  onSaveConfig,
  onViewRequests,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [isEnabled, setIsEnabled] = useState(config?.isEnabled ?? false);
  const [selectedDays, setSelectedDays] = useState<string[]>(config?.availableDays ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(config?.availableTimeSlots ?? DEFAULT_SLOTS);

  const toggleDay = useCallback((day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const toggleSlot = useCallback((slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.start === slot.start);
      return exists ? prev.filter((s) => s.start !== slot.start) : [...prev, slot];
    });
  }, []);

  const handleSave = useCallback(() => {
    if (isEnabled && selectedDays.length === 0) {
      crossPlatformAlert(t('common.error'), t('booking.settings.selectDaysError'));
      return;
    }
    if (isEnabled && selectedSlots.length === 0) {
      crossPlatformAlert(t('common.error'), t('booking.settings.selectSlotsError'));
      return;
    }
    onSaveConfig({
      isEnabled,
      slotDurationMinutes: 30,
      availableDays: selectedDays,
      availableTimeSlots: selectedSlots.sort((a, b) => a.start.localeCompare(b.start)),
    });
  }, [isEnabled, selectedDays, selectedSlots, onSaveConfig, t]);

  return (
    <SectionCard title={t('booking.settings.title')} defaultExpanded>
      {/* Enable/Disable Toggle */}
      {isEditMode && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
            {t('booking.settings.enableBooking')}
          </AppText>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: theme.toggleTrack, true: `${colors.primary}80` }}
            thumbColor={isEnabled ? colors.primary : theme.textMuted}
          />
        </View>
      )}

      {!isEditMode && !config?.isEnabled && (
        <AppText style={{ fontSize: 14, color: theme.textMuted, textAlign: 'center', paddingVertical: 8 }}>
          {t('booking.settings.disabled')}
        </AppText>
      )}

      {/* Day Selector */}
      {isEditMode && isEnabled && (
        <View style={{ marginBottom: 16 }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            {t('booking.settings.availableDays')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALL_DAYS.map((day) => {
              const isActive = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={DAY_LABELS[day]}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: isActive ? colors.primary : theme.card,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: theme.border,
                  }}
                >
                  <AppText style={{ fontSize: 13, fontWeight: '600', color: isActive ? colors.white : theme.textSecondary }}>
                    {DAY_LABELS[day]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Time Slot Selector */}
      {isEditMode && isEnabled && (
        <View style={{ marginBottom: 16 }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            {t('booking.settings.timeSlots')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DEFAULT_SLOTS.map((slot) => {
              const isActive = selectedSlots.some((s) => s.start === slot.start);
              return (
                <Pressable
                  key={slot.start}
                  onPress={() => toggleSlot(slot)}
                  accessibilityRole="button"
                  accessibilityLabel={`${slot.start} - ${slot.end}`}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isActive ? colors.primary : theme.card,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: theme.border,
                  }}
                >
                  <AppText style={{ fontSize: 12, fontWeight: '500', color: isActive ? colors.white : theme.textSecondary }}>
                    {slot.start}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Save Button (edit mode) */}
      {isEditMode && isEnabled && (
        <AppButton
          title={t('booking.settings.save')}
          variant="primary"
          size="sm"
          onPress={handleSave}
          accessibilityLabel={t('booking.settings.save')}
          accessibilityRole="button"
        />
      )}

      {/* View Requests Button (view mode) */}
      {!isEditMode && config?.isEnabled && (
        <Pressable
          onPress={onViewRequests}
          accessibilityRole="button"
          accessibilityLabel={t('booking.viewRequests')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: `${colors.primary}15`,
            marginTop: 8,
          }}
        >
          <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={colors.primary} />
          <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.primary, marginLeft: 8 }}>
            {t('booking.viewRequests')}
          </AppText>
        </Pressable>
      )}

      {/* Summary in view mode */}
      {!isEditMode && config?.isEnabled && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {config.availableDays.map((day) => (
              <View key={day} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: `${colors.primary}20` }}>
                <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.primary }}>{DAY_LABELS[day]}</AppText>
              </View>
            ))}
          </View>
          <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8 }}>
            {config.availableTimeSlots.length} {t('booking.settings.slotsAvailable')}
          </AppText>
        </View>
      )}
    </SectionCard>
  );
};
