import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useSupportTickets } from '../hooks/useSupportTickets';
import { SupportTicketEntity, SupportTicketStatus, SupportTicketCategory } from '@/domain/support/entities/supportTicketEntity';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES: { key: SupportTicketCategory; labelKey: string }[] = [
  { key: 'ACCOUNT',   labelKey: 'support.category.account' },
  { key: 'TECHNICAL', labelKey: 'support.category.technical' },
  { key: 'GENERAL',   labelKey: 'support.category.general' },
  { key: 'OTHER',     labelKey: 'support.category.other' },
];

const STATUS_CONFIG: Record<SupportTicketStatus, { label: string; color: string; bg: string }> = {
  OPEN:        { label: 'Open',        color: '#60A5FA', bg: '#1D4ED820' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#B4530920' },
  RESOLVED:    { label: 'Resolved',    color: '#34D399', bg: '#065F4620' },
  CLOSED:      { label: 'Closed',      color: '#94A3B8', bg: '#94A3B820' },
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Sub-components ────────────────────────────────────────────────────────────
interface TicketItemProps {
  item: SupportTicketEntity;
  onPress: (item: SupportTicketEntity) => void;
}
const TicketItem: React.FC<TicketItemProps> = React.memo(({ item, onPress }) => {
  const theme = useTheme();
  const status = STATUS_CONFIG[item.status];
  const ticketNumber = `SUP-${item.id.slice(-6).toUpperCase()}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ticketNumber}: ${item.subject}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        backgroundColor: pressed ? `${colors.neonPurple}10` : theme.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.border,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <AppText style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>{ticketNumber}</AppText>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: status.bg }}>
          <AppText style={{ fontSize: 11, color: status.color, fontWeight: '700' }}>{status.label}</AppText>
        </View>
      </View>
      <AppText style={{ fontSize: 14, color: theme.text, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
        {item.subject}
      </AppText>
      <AppText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }} numberOfLines={2}>
        {item.message}
      </AppText>
      {item.adminReply ? (
        <View style={{
          backgroundColor: `${colors.neonPurple}15`,
          borderRadius: 8,
          padding: 10,
          borderLeftWidth: 3,
          borderLeftColor: colors.neonPurple,
          marginBottom: 8,
        }}>
          <AppText style={{ fontSize: 11, color: colors.neonPurple, fontWeight: '700', marginBottom: 2 }}>
            Admin Reply
          </AppText>
          <AppText style={{ fontSize: 12, color: theme.text }} numberOfLines={3}>
            {item.adminReply}
          </AppText>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="clock-outline" size={12} color={theme.textMuted} />
        <AppText style={{ fontSize: 11, color: theme.textMuted }}>{formatDate(item.createdAt)}</AppText>
      </View>
    </Pressable>
  );
});

interface TicketDetailModalProps {
  ticket: SupportTicketEntity | null;
  onClose: () => void;
}
const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose }) => {
  const theme = useTheme();
  if (!ticket) return null;
  const status = STATUS_CONFIG[ticket.status];
  const ticketNumber = `SUP-${ticket.id.slice(-6).toUpperCase()}`;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent={Platform.OS !== 'web'}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 40,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          maxHeight: '85%',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color={colors.neonPurple} />
              <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{ticketNumber}</AppText>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 14 }}>
              <View>
                <AppText style={{ fontSize: 11, color: theme.textMuted, marginBottom: 3 }}>Subject</AppText>
                <AppText style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>{ticket.subject}</AppText>
              </View>
              <View>
                <AppText style={{ fontSize: 11, color: theme.textMuted, marginBottom: 3 }}>Category</AppText>
                <AppText style={{ fontSize: 13, color: theme.text }}>{ticket.category}</AppText>
              </View>
              <View>
                <AppText style={{ fontSize: 11, color: theme.textMuted, marginBottom: 3 }}>Message</AppText>
                <AppText style={{ fontSize: 13, color: theme.text }}>{ticket.message}</AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: status.bg }}>
                  <AppText style={{ fontSize: 12, color: status.color, fontWeight: '700' }}>{status.label}</AppText>
                </View>
                <AppText style={{ fontSize: 11, color: theme.textMuted }}>{formatDate(ticket.createdAt)}</AppText>
              </View>
              {ticket.adminReply ? (
                <View style={{
                  backgroundColor: `${colors.neonPurple}15`,
                  borderRadius: 10,
                  padding: 14,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.neonPurple,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <MaterialCommunityIcons name="shield-account-outline" size={16} color={colors.neonPurple} />
                    <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '700' }}>Admin Reply</AppText>
                  </View>
                  <AppText style={{ fontSize: 13, color: theme.text }}>{ticket.adminReply}</AppText>
                </View>
              ) : (
                <View style={{
                  backgroundColor: `${theme.textMuted}10`,
                  borderRadius: 10,
                  padding: 14,
                  alignItems: 'center',
                }}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={theme.textMuted} />
                  <AppText style={{ fontSize: 12, color: theme.textMuted, marginTop: 6, textAlign: 'center' }}>
                    Waiting for a response from our support team.
                  </AppText>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SupportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { tickets, isLoading, isSubmitting, error, submitSuccess, submitTicket, refresh, clearSubmitSuccess } =
    useSupportTickets();

  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('GENERAL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketEntity | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'DONE'>('ALL');

  const handleSubjectChange = useCallback((text: string) => {
    setSubject(text);
    if (subjectError && text.trim().length > 0) setSubjectError(null);
  }, [subjectError]);

  const handleMessageChange = useCallback((text: string) => {
    setMessage(text);
    if (messageError && text.trim().length >= 10) setMessageError(null);
  }, [messageError]);

  const handleSubmit = useCallback(async () => {
    let hasError = false;
    if (!subject.trim()) {
      setSubjectError(t('support.subjectRequired'));
      hasError = true;
    }
    if (message.trim().length < 10) {
      setMessageError(t('support.messageMinLength'));
      hasError = true;
    }
    if (hasError) return;
    setSubjectError(null);
    setMessageError(null);
    await submitTicket(subject.trim(), message.trim(), category);
  }, [subject, message, category, submitTicket, t]);

  // Reset form on success
  React.useEffect(() => {
    if (submitSuccess) {
      setSubject('');
      setMessage('');
      setCategory('GENERAL');
      setSubjectError(null);
      setMessageError(null);
      setActiveTab('history');
      clearSubmitSuccess();
    }
  }, [submitSuccess, clearSubmitSuccess]);

  const isFormValid = true;

  return (
    <ScreenLayout>
      <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(51, 65, 85, 0.3)',
      }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>
          {t('support.title')}
        </AppText>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8, marginBottom: 16 }}>
        {(['new', 'history'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: active ? colors.neonPurple : theme.card,
                borderWidth: 1,
                borderColor: active ? colors.neonPurple : theme.border,
                alignItems: 'center',
              }}
            >
              <AppText style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFFFFF' : theme.textSecondary }}>
                {tab === 'new' ? t('support.newTicket') : t('support.myTickets')}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'new' ? (
          <View style={{ gap: 16 }}>
            {/* Info banner */}
            <View style={{
              backgroundColor: `${colors.neonPurple}15`,
              borderRadius: 12,
              padding: 14,
              flexDirection: 'row',
              gap: 10,
              borderWidth: 1,
              borderColor: `${colors.neonPurple}30`,
            }}>
              <MaterialCommunityIcons name="information-outline" size={18} color={colors.neonPurple} style={{ marginTop: 1 }} />
              <AppText style={{ flex: 1, fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                {t('support.infoBanner')}
              </AppText>
            </View>

            {/* Error */}
            {error ? (
              <View style={{ backgroundColor: `${colors.error}15`, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: `${colors.error}40` }}>
                <AppText style={{ fontSize: 13, color: colors.error }}>{error}</AppText>
              </View>
            ) : null}

            {/* Category */}
            <View>
              <AppText style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                {t('support.category.label')}
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        onPress={() => setCategory(cat.key)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: active ? `${colors.neonPurple}30` : theme.card,
                          borderWidth: 1.5,
                          borderColor: active ? colors.neonPurple : theme.border,
                        }}
                      >
                        <AppText style={{ fontSize: 12, fontWeight: '600', color: active ? colors.neonPurple : theme.textSecondary }}>
                          {t(cat.labelKey)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Subject */}
            <View>
              <AppText style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                {t('support.subjectLabel')}
              </AppText>
              <TextInput
                value={subject}
                onChangeText={handleSubjectChange}
                placeholder={t('support.subjectPlaceholder')}
                placeholderTextColor={theme.textMuted}
                maxLength={100}
                accessibilityLabel={t('support.subjectLabel')}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: subjectError ? colors.error : theme.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: theme.text,
                }}
              />
              {subjectError ? (
                <AppText style={{ fontSize: 11, color: colors.error, marginTop: 4 }}>{subjectError}</AppText>
              ) : null}
            </View>

            {/* Message */}
            <View>
              <AppText style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                {t('support.messageLabel')}
              </AppText>
              <TextInput
                value={message}
                onChangeText={handleMessageChange}
                placeholder={t('support.messagePlaceholder')}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={5}
                maxLength={1000}
                accessibilityLabel={t('support.messageLabel')}
                textAlignVertical="top"
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: messageError ? colors.error : theme.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: theme.text,
                  minHeight: 120,
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                {messageError ? (
                  <AppText style={{ fontSize: 11, color: colors.error, flex: 1 }}>{messageError}</AppText>
                ) : (
                  <View />
                )}
                <AppText style={{ fontSize: 11, color: theme.textSecondary }}>{message.length}/1000</AppText>
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={t('support.submit')}
              style={({ pressed }) => ({
                backgroundColor: !isSubmitting
                  ? pressed ? `${colors.neonPurple}CC` : colors.neonPurple
                  : `${colors.neonPurple}40`,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 4,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                  {t('support.submit')}
                </AppText>
              )}
            </Pressable>
          </View>
        ) : (
          /* History tab */
          <View>
            {/* Status filter tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  { key: 'ALL', label: t('support.filterAll') },
                  { key: 'OPEN', label: t('support.filterOpen') },
                  { key: 'IN_PROGRESS', label: t('support.filterInProgress') },
                  { key: 'DONE', label: t('support.filterDone') },
                ] as const).map(({ key, label }) => {
                  const active = statusFilter === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setStatusFilter(key)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        borderRadius: 20,
                        backgroundColor: active ? colors.neonPurple : theme.card,
                        borderWidth: 1,
                        borderColor: active ? colors.neonPurple : theme.border,
                      }}
                    >
                      <AppText style={{ fontSize: 12, fontWeight: '600', color: active ? '#FFFFFF' : theme.textSecondary }}>
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {(() => {
              const filtered = tickets.filter((t) => {
                if (statusFilter === 'ALL') return true;
                if (statusFilter === 'OPEN') return t.status === 'OPEN';
                if (statusFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
                if (statusFilter === 'DONE') return t.status === 'RESOLVED' || t.status === 'CLOSED';
                return true;
              });

              if (isLoading) {
                return <ActivityIndicator color={colors.neonPurple} style={{ marginTop: 40 }} />;
              }
              if (error) {
                return (
                  <View style={{ alignItems: 'center', paddingTop: 40 }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
                    <AppText style={{ color: theme.textSecondary, marginTop: 12, fontSize: 14 }}>{error}</AppText>
                    <Pressable onPress={refresh} accessibilityRole="button" style={{ marginTop: 16 }}>
                      <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>{t('common.retry')}</AppText>
                    </Pressable>
                  </View>
                );
              }
              if (tickets.length === 0) {
                return (
                  <View style={{ alignItems: 'center', paddingTop: 60 }}>
                    <MaterialCommunityIcons name="ticket-outline" size={56} color={theme.textMuted} />
                    <AppText style={{ color: theme.textMuted, marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                      {t('support.noTickets')}
                    </AppText>
                    <Pressable onPress={() => setActiveTab('new')} accessibilityRole="button" style={{ marginTop: 16 }}>
                      <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>{t('support.submitFirst')}</AppText>
                    </Pressable>
                  </View>
                );
              }
              if (filtered.length === 0) {
                return (
                  <View style={{ alignItems: 'center', paddingTop: 60 }}>
                    <MaterialCommunityIcons name="ticket-outline" size={56} color={theme.textMuted} />
                    <AppText style={{ color: theme.textMuted, marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                      {t('support.noTicketsForFilter')}
                    </AppText>
                  </View>
                );
              }
              return filtered.map((item) => (
                <TicketItem key={item.id} item={item} onPress={setSelectedTicket} />
              ));
            })()}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
