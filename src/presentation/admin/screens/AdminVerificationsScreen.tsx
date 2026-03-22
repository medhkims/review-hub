import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { useAdminVerifications, VerificationTab } from '../hooks/useAdminVerifications';
import { VerificationEntity } from '@/domain/verification/entities/verificationEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Reject Modal ────────────────────────────────────────────────────────────

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ visible, onClose, onConfirm, isLoading }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reason, setReason] = useState('');

  const handleConfirm = useCallback(() => {
    onConfirm(reason.trim());
  }, [reason, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            {t('admin.verifications.rejectTitle')}
          </AppText>
          <AppText style={{ fontSize: 14, color: theme.textMuted, marginBottom: 16 }}>
            {t('admin.verifications.rejectSubtitle')}
          </AppText>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t('admin.verifications.rejectReasonPlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 12,
              color: theme.text,
              fontSize: 14,
              marginBottom: 20,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            accessibilityLabel={t('admin.verifications.rejectReasonPlaceholder')}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
              }}
            >
              <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.textMuted }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('admin.verifications.reject')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: colors.error,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textWhite }}>
                  {t('admin.verifications.reject')}
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#FBB024', label: 'pending' },
  approved: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: colors.success, label: 'approved' },
  rejected: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: colors.error, label: 'rejected' },
};

// ─── Verification Card ────────────────────────────────────────────────────────

interface VerificationCardProps {
  item: VerificationEntity;
  onApprove: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ item, onApprove, onReject, isUpdating }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [idCardVisible, setIdCardVisible] = useState(false);
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* User info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(168,85,247,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="account" size={22} color={colors.neonPurple} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
            {item.fullName}
          </AppText>
          <AppText style={{ fontSize: 12, color: theme.textMuted }}>
            {item.userEmail}
          </AppText>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: statusStyle.bg,
            borderWidth: 1,
            borderColor: statusStyle.border,
          }}
        >
          <AppText style={{ fontSize: 11, fontWeight: '600', color: statusStyle.text }}>
            {t(`admin.verifications.${statusStyle.label}`)}
          </AppText>
        </View>
      </View>

      {/* Details */}
      <View style={{ gap: 6, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="phone" size={14} color={theme.textMuted} />
          <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
            {item.phoneNumber}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="calendar" size={14} color={theme.textMuted} />
          <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
            {formatDate(item.submittedAt)}
          </AppText>
        </View>
        {item.reviewedAt ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color={theme.textMuted} />
            <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
              {t('admin.verifications.reviewedAt')}: {formatDate(item.reviewedAt)}
            </AppText>
          </View>
        ) : null}
        {item.rejectionReason ? (
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderRadius: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.2)',
              marginTop: 4,
            }}
          >
            <AppText style={{ fontSize: 12, color: colors.error, fontWeight: '600', marginBottom: 2 }}>
              {t('admin.verifications.rejectionReason')}
            </AppText>
            <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
              {item.rejectionReason}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ID Card preview */}
      <Pressable
        onPress={() => setIdCardVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('admin.verifications.viewIdCard')}
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: item.status === 'pending' ? 14 : 0,
          height: 120,
        }}
      >
        <Image
          source={{ uri: item.idCardUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityLabel={t('admin.verifications.idCard')}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingVertical: 6,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <MaterialCommunityIcons name="eye" size={14} color={colors.textWhite} />
          <AppText style={{ fontSize: 12, color: colors.textWhite }}>
            {t('admin.verifications.viewIdCard')}
          </AppText>
        </View>
      </Pressable>

      {/* Actions — only for pending */}
      {item.status === 'pending' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={onReject}
            disabled={isUpdating}
            accessibilityRole="button"
            accessibilityLabel={t('admin.verifications.reject')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>
              {t('admin.verifications.reject')}
            </AppText>
          </Pressable>
          <Pressable
            onPress={onApprove}
            disabled={isUpdating}
            accessibilityRole="button"
            accessibilityLabel={t('admin.verifications.approve')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: 'rgba(34,197,94,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(34,197,94,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.success }}>
                {t('admin.verifications.approve')}
              </AppText>
            )}
          </Pressable>
        </View>
      ) : null}

      {/* Full-screen ID card modal */}
      <Modal visible={idCardVisible} transparent animationType="fade" onRequestClose={() => setIdCardVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <Pressable
            onPress={() => setIdCardVisible(false)}
            accessibilityRole="button"
            accessibilityLabel={t('verification.close')}
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 }}
          >
            <MaterialCommunityIcons name="close" size={28} color={colors.textWhite} />
          </Pressable>
          <Image
            source={{ uri: item.idCardUrl }}
            style={{ width: '90%', height: '60%' }}
            resizeMode="contain"
            accessibilityLabel={t('admin.verifications.idCard')}
          />
        </View>
      </Modal>
    </View>
  );
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: VerificationTab[] = ['pending', 'approved', 'rejected'];

interface TabBarProps {
  active: VerificationTab;
  onSwitch: (tab: VerificationTab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ active, onSwitch }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 4,
        gap: 4,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab === active;
        const style = STATUS_STYLES[tab];
        return (
          <Pressable
            key={tab}
            onPress={() => onSwitch(tab)}
            accessibilityRole="button"
            accessibilityLabel={t(`admin.verifications.${tab}`)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: isActive ? style.bg : 'transparent',
              borderWidth: isActive ? 1 : 0,
              borderColor: isActive ? style.border : 'transparent',
            }}
          >
            <AppText
              style={{
                fontSize: 13,
                fontWeight: isActive ? '700' : '500',
                color: isActive ? style.text : theme.textMuted,
              }}
            >
              {t(`admin.verifications.${tab}`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminVerificationsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { activeTab, switchTab, verifications, isLoading, isUpdating, error, load, approve, reject } =
    useAdminVerifications();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const handleRejectConfirm = useCallback(
    async (reason: string) => {
      if (!rejectTarget) return;
      await reject(rejectTarget, reason);
      setRejectTarget(null);
    },
    [rejectTarget, reject],
  );

  const emptyKey =
    activeTab === 'pending'
      ? 'admin.verifications.empty'
      : activeTab === 'approved'
        ? 'admin.verifications.emptyApproved'
        : 'admin.verifications.emptyRejected';

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <AdminMenuButton />
        <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
          {t('admin.verifications.title')}
        </AppText>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: 'rgba(168,85,247,0.15)',
          }}
        >
          <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
            {verifications.length}
          </AppText>
        </View>
      </View>

      {/* Tab Bar */}
      <TabBar active={activeTab} onSwitch={switchTab} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.neonPurple} />}
      >
        {error ? (
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <AppText style={{ fontSize: 14, color: colors.error, textAlign: 'center' }}>
              {error}
            </AppText>
          </View>
        ) : null}

        {isLoading && verifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        ) : verifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 }}>
            <MaterialCommunityIcons name="shield-check" size={56} color={colors.textSlate500} />
            <AppText style={{ fontSize: 16, color: theme.textMuted, textAlign: 'center' }}>
              {t(emptyKey)}
            </AppText>
          </View>
        ) : (
          verifications.map((item) => (
            <VerificationCard
              key={item.id}
              item={item}
              onApprove={() => approve(item.id)}
              onReject={() => setRejectTarget(item.id)}
              isUpdating={isUpdating === item.id}
            />
          ))
        )}
      </ScrollView>

      <RejectModal
        visible={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isUpdating === rejectTarget}
      />
    </ScreenLayout>
  );
}
