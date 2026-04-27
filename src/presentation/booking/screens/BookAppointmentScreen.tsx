import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { DateSelector } from '../components/DateSelector';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { BookingConfigEntity } from '@/domain/booking/entities/bookingConfigEntity';

const MAX_NOTE_LENGTH = 200;

export default function BookAppointmentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { businessId, businessName } = useLocalSearchParams<{ businessId: string; businessName: string }>();
  const { user } = useAuthStore();

  const [config, setConfig] = useState<BookingConfigEntity | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    (async () => {
      setIsLoadingConfig(true);
      const result = await container.getBookingConfigUseCase.execute(businessId);
      result.fold(
        () => setIsLoadingConfig(false),
        (cfg) => { setConfig(cfg); setIsLoadingConfig(false); },
      );
    })();
  }, [businessId]);

  const handleSubmit = useCallback(async () => {
    if (!businessId || !businessName || !user || !selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    const result = await container.createBookingRequestUseCase.execute({
      businessId,
      businessName,
      userId: user.id,
      userName: user.displayName || user.email,
      date: selectedDate,
      timeSlot: selectedSlot,
      note,
    });
    setIsSubmitting(false);
    result.fold(
      (failure) => Alert.alert(t('common.error'), failure.message),
      () => {
        Alert.alert(t('booking.successTitle'), t('booking.successMessage'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      },
    );
  }, [businessId, businessName, user, selectedDate, selectedSlot, note, t, router]);

  const canSubmit = selectedDate && selectedSlot && !isSubmitting;

  if (isLoadingConfig) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!config || !config.isEnabled) {
    return (
      <ScreenLayout>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
          <AppButton variant="ghost" onPress={() => router.back()} icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />} />
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginLeft: 8 }}>
            {t('booking.title')}
          </AppText>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color={theme.textMuted} />
          <AppText style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
            {t('booking.notAvailable')}
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
        <AppButton variant="ghost" onPress={() => router.back()} icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />} />
        <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginLeft: 8 }}>
          {t('booking.title')}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Business Name */}
        <Card style={{ marginHorizontal: 16, marginBottom: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={colors.primary} />
            <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginLeft: 10 }}>
              {businessName}
            </AppText>
          </View>
        </Card>

        {/* Step 1: Select Date */}
        <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text, paddingHorizontal: 16, marginBottom: 12 }}>
          {t('booking.selectDate')}
        </AppText>
        <DateSelector
          availableDays={config.availableDays}
          selectedDate={selectedDate}
          onSelectDate={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
        />

        {/* Step 2: Select Time */}
        {selectedDate && (
          <View style={{ marginTop: 24 }}>
            <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text, paddingHorizontal: 16, marginBottom: 12 }}>
              {t('booking.selectTime')}
            </AppText>
            <TimeSlotGrid
              slots={config.availableTimeSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </View>
        )}

        {/* Step 3: Note */}
        {selectedSlot && (
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 12 }}>
              {t('booking.addNote')}
            </AppText>
            <TextInput
              value={note}
              onChangeText={(text) => setNote(text.slice(0, MAX_NOTE_LENGTH))}
              placeholder={t('booking.notePlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={MAX_NOTE_LENGTH}
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                padding: 14,
                color: theme.text,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
            <AppText style={{ fontSize: 12, color: theme.textMuted, textAlign: 'right', marginTop: 4 }}>
              {note.length}/{MAX_NOTE_LENGTH}
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: theme.background }}>
        <AppButton
          title={t('booking.bookNow')}
          onPress={handleSubmit}
          disabled={!canSubmit}
          isLoading={isSubmitting}
          size="lg"
        />
      </View>
    </ScreenLayout>
  );
}
