import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BookingRequestEntity, BookingStatus } from '@/domain/booking/entities/bookingRequestEntity';
import { useTranslation } from 'react-i18next';

interface BookingRequestCardProps {
  request: BookingRequestEntity;
  isOwnerView: boolean;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
}

const STATUS_CONFIG: Record<BookingStatus, { color: string; icon: string }> = {
  pending: { color: colors.warning, icon: 'clock-outline' },
  confirmed: { color: colors.success, icon: 'check-circle-outline' },
  rejected: { color: colors.error, icon: 'close-circle-outline' },
  cancelled: { color: colors.textSlate500, icon: 'cancel' },
};

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({ request, isOwnerView, onConfirm, onReject }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const statusCfg = STATUS_CONFIG[request.status];

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text, flex: 1 }}>
          {isOwnerView ? request.userName : request.businessName}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${statusCfg.color}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
          <MaterialCommunityIcons name={statusCfg.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={14} color={statusCfg.color} />
          <AppText style={{ fontSize: 12, fontWeight: '600', color: statusCfg.color, marginLeft: 4 }}>
            {t(`booking.status.${request.status}`)}
          </AppText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <MaterialCommunityIcons name="calendar" size={16} color={theme.textSecondary} />
        <AppText style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 6 }}>{request.date}</AppText>
        <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textSecondary} style={{ marginLeft: 16 }} />
        <AppText style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 6 }}>{request.timeSlot}</AppText>
      </View>

      {request.note ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
          <MaterialCommunityIcons name="note-text-outline" size={16} color={theme.textMuted} style={{ marginTop: 2 }} />
          <AppText style={{ fontSize: 13, color: theme.textMuted, marginLeft: 6, flex: 1 }}>{request.note}</AppText>
        </View>
      ) : null}

      {isOwnerView && request.status === 'pending' && (
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
          <Pressable
            onPress={() => onConfirm?.(request.id)}
            accessibilityRole="button"
            accessibilityLabel={t('booking.confirm')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.success,
              alignItems: 'center',
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>{t('booking.confirm')}</AppText>
          </Pressable>
          <Pressable
            onPress={() => onReject?.(request.id)}
            accessibilityRole="button"
            accessibilityLabel={t('booking.reject')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.error,
              alignItems: 'center',
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>{t('booking.reject')}</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
};
