import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { BookingRequestEntity } from '@/domain/booking/entities/bookingRequestEntity';

export default function BookingRequestsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  const [requests, setRequests] = useState<BookingRequestEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!businessId) return;
    setIsLoading(true);
    const result = await container.getBusinessBookingRequestsUseCase.execute(businessId);
    result.fold(
      () => setIsLoading(false),
      (data) => { setRequests(data); setIsLoading(false); },
    );
  }, [businessId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleConfirm = useCallback(async (requestId: string) => {
    const result = await container.updateBookingRequestStatusUseCase.execute(requestId, 'confirmed');
    result.fold(
      (failure) => Alert.alert(t('common.error'), failure.message),
      () => {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'confirmed' as const } : r)),
        );
      },
    );
  }, [t]);

  const handleReject = useCallback(async (requestId: string) => {
    Alert.alert(t('booking.rejectConfirmTitle'), t('booking.rejectConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('booking.reject'),
        style: 'destructive',
        onPress: async () => {
          const result = await container.updateBookingRequestStatusUseCase.execute(requestId, 'rejected');
          result.fold(
            (failure) => Alert.alert(t('common.error'), failure.message),
            () => {
              setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r)),
              );
            },
          );
        },
      },
    ]);
  }, [t]);

  const renderItem = useCallback(({ item }: { item: BookingRequestEntity }) => (
    <BookingRequestCard
      request={item}
      isOwnerView
      onConfirm={handleConfirm}
      onReject={handleReject}
    />
  ), [handleConfirm, handleReject]);

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
        <AppButton variant="ghost" onPress={() => router.back()} icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />} />
        <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginLeft: 8 }}>
          {t('booking.requests')}
        </AppText>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={theme.textMuted} />
          <AppText style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
            {t('booking.noRequests')}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        />
      )}
    </ScreenLayout>
  );
}
