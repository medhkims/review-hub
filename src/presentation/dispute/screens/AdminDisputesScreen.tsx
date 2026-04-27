import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Pressable, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useTheme } from '@/core/theme/useTheme';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { DisputeEntity, DisputeStatus, DisputeReason } from '@/domain/dispute/entities/disputeEntity';

type TabKey = 'all' | 'pending' | 'upheld' | 'dismissed';
const TABS: TabKey[] = ['all', 'pending', 'upheld', 'dismissed'];

const STATUS_COLORS: Record<DisputeStatus, string> = {
  pending: colors.warning, reviewed: colors.blue, upheld: colors.success, dismissed: colors.error,
};

const reasonKey = (r: DisputeReason) => `dispute.reason_${r}` as const;

export default function AdminDisputesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const [tab, setTab] = useState<TabKey>('all');
  const [disputes, setDisputes] = useState<DisputeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DisputeEntity | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    const result = await container.getDisputesUseCase.execute();
    result.fold(
      () => setDisputes([]),
      (data: DisputeEntity[]) => setDisputes(data),
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const filtered = tab === 'all' ? disputes : disputes.filter((d) => d.status === tab);

  const handleResolve = useCallback(async (status: 'upheld' | 'dismissed') => {
    if (!selected || !authUser) return;
    setResolving(true);
    await container.resolveDisputeUseCase.execute({
      disputeId: selected.id,
      status,
      adminNotes,
      resolvedById: authUser.id,
      removeReview: status === 'upheld',
    });
    setResolving(false);
    setSelected(null);
    setAdminNotes('');
    fetchDisputes();
  }, [selected, authUser, adminNotes, fetchDisputes]);

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i} name={i <= rating ? 'star' : 'star-outline'}
          size={14} color={colors.warning}
        />
      ))}
    </View>
  );

  const renderCard = useCallback(({ item }: { item: DisputeEntity }) => (
    <Pressable
      onPress={() => { setSelected(item); setAdminNotes(item.adminNotes || ''); }}
      style={{ backgroundColor: theme.card, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 14, marginBottom: 12 }}
      accessibilityRole="button" accessibilityLabel={`${t('dispute.title')} ${item.businessName}`}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontWeight: '700', fontSize: 15 }}>{item.businessName}</AppText>
          {renderStars(item.reviewRating)}
        </View>
        <View style={{ backgroundColor: STATUS_COLORS[item.status] + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
          <AppText style={{ color: STATUS_COLORS[item.status], fontSize: 12, fontWeight: '600' }}>
            {t(`dispute.${item.status}`)}
          </AppText>
        </View>
      </View>
      <View style={{ backgroundColor: colors.neonPurple + '18', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 }}>
        <AppText style={{ color: colors.neonPurple, fontSize: 11, fontWeight: '600' }}>{t(reasonKey(item.reason))}</AppText>
      </View>
      <AppText style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>
        {t('dispute.disputedBy')}: {item.disputedByName} - {item.createdAt.toLocaleDateString()}
      </AppText>
      <AppText style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }} numberOfLines={2}>
        {item.reviewText.substring(0, 100)}{item.reviewText.length > 100 ? '...' : ''}
      </AppText>
      <AppText style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }} numberOfLines={2}>
        {item.explanation}
      </AppText>
    </Pressable>
  ), [theme, t]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('dispute.title')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 20, fontWeight: '700', marginLeft: 12 }}>{t('dispute.title')}</AppText>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 }}>
        {TABS.map((tk) => {
          const active = tk === tab;
          return (
            <Pressable key={tk} onPress={() => setTab(tk)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: active ? colors.neonPurple : theme.card, borderWidth: 1, borderColor: active ? colors.neonPurple : theme.border }}
              accessibilityRole="tab" accessibilityLabel={t(`dispute.${tk}`)}
            >
              <AppText style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFF' : theme.textSecondary }}>
                {t(`dispute.${tk}`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.neonPurple} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <MaterialCommunityIcons name="shield-check-outline" size={48} color={theme.textMuted} />
          <AppText style={{ color: theme.textMuted, marginTop: 12 }}>{t('dispute.noDisputes')}</AppText>
        </View>
      ) : (
        <FlatList data={filtered} keyExtractor={(d) => d.id} renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} />
      )}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 20 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                <AppText style={{ fontSize: 18, fontWeight: '700' }}>{selected?.businessName}</AppText>
                <Pressable onPress={() => setSelected(null)} accessibilityRole="button" accessibilityLabel="Close">
                  <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
                </Pressable>
              </View>
              {selected && renderStars(selected.reviewRating)}
              <AppText style={{ color: colors.neonPurple, fontWeight: '600', fontSize: 13, marginTop: 10 }}>
                {t(reasonKey(selected?.reason || 'other'))}
              </AppText>
              <AppText style={{ fontWeight: '600', marginTop: 14, marginBottom: 4 }}>{t('dispute.reviewText')}</AppText>
              <AppText style={{ color: theme.textSecondary, fontSize: 13 }}>{selected?.reviewText}</AppText>
              <AppText style={{ fontWeight: '600', marginTop: 14, marginBottom: 4 }}>{t('dispute.explanation')}</AppText>
              <AppText style={{ color: theme.textSecondary, fontSize: 13 }}>{selected?.explanation}</AppText>
              {(selected?.evidenceUrls?.length ?? 0) > 0 && (
                <>
                  <AppText style={{ fontWeight: '600', marginTop: 14, marginBottom: 4 }}>{t('dispute.evidence')}</AppText>
                  {selected?.evidenceUrls.map((url, i) => (
                    <AppText key={i} style={{ color: colors.blue, fontSize: 12 }}>{url}</AppText>
                  ))}
                </>
              )}
              {selected?.reviewerResponse && (
                <>
                  <AppText style={{ fontWeight: '600', marginTop: 14, marginBottom: 4 }}>{t('dispute.reviewerResponse')}</AppText>
                  <AppText style={{ color: theme.textSecondary, fontSize: 13 }}>{selected.reviewerResponse}</AppText>
                </>
              )}
              <AppText style={{ fontWeight: '600', marginTop: 14, marginBottom: 6 }}>{t('dispute.adminNotes')}</AppText>
              <TextInput value={adminNotes} onChangeText={setAdminNotes} multiline numberOfLines={3}
                placeholder={t('dispute.adminNotes')} placeholderTextColor={theme.textMuted}
                style={{ backgroundColor: theme.background, color: theme.text, borderRadius: 10, borderWidth: 1, borderColor: theme.border, padding: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top' }}
              />
              {selected?.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                  <Pressable onPress={() => handleResolve('upheld')} disabled={resolving}
                    style={{ flex: 1, backgroundColor: colors.error, borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: resolving ? 0.6 : 1 }}
                    accessibilityRole="button" accessibilityLabel={t('dispute.upholdAndRemove')}
                  >
                    <AppText style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{t('dispute.upholdAndRemove')}</AppText>
                  </Pressable>
                  <Pressable onPress={() => handleResolve('dismissed')} disabled={resolving}
                    style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: resolving ? 0.6 : 1 }}
                    accessibilityRole="button" accessibilityLabel={t('dispute.dismissDispute')}
                  >
                    <AppText style={{ fontWeight: '700', fontSize: 14 }}>{t('dispute.dismissDispute')}</AppText>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
