import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Modal, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { useTickets } from '../hooks/useTickets';
import { useAdminSupportTickets } from '../hooks/useAdminSupportTickets';
import { useAdminBadgeStore } from '../store/adminBadgeStore';
import { TicketEntity, TicketStatus, TicketPriority } from '@/domain/ticket/entities/ticketEntity';
import { SupportTicketEntity, SupportTicketStatus } from '@/domain/support/entities/supportTicketEntity';

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterTab = 'ALL' | TicketStatus;

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; firestoreKey: string }> = {
  OPEN:        { label: 'Open',        color: '#60A5FA', bg: '#1D4ED820', firestoreKey: 'pending' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#B4530920', firestoreKey: 'in_progress' },
  RESOLVED:    { label: 'Resolved',    color: '#34D399', bg: '#065F4620', firestoreKey: 'resolved' },
  CLOSED:      { label: 'Closed',      color: colors.textSlate400, bg: `${colors.textSlate400}20`, firestoreKey: 'closed' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  LOW:    { label: 'Low',    color: colors.textSlate400 },
  MEDIUM: { label: 'Medium', color: '#60A5FA' },
  HIGH:   { label: 'High',   color: '#F59E0B' },
  URGENT: { label: 'Urgent', color: '#EF4444' },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',         label: 'All' },
  { key: 'OPEN',        label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED',    label: 'Resolved' },
  { key: 'CLOSED',      label: 'Closed' },
];

const STATUS_ACTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    spam: 'Spam or fake listing',
    inappropriate: 'Inappropriate content',
    wrongInfo: 'Wrong or misleading information',
    closed: 'Business is permanently closed',
  };
  if (reason.startsWith('other: ')) return reason.slice(7);
  return map[reason] ?? reason;
}

// ── Sub-components ────────────────────────────────────────────────────────────
interface StatCardProps { count: number; label: string; color: string }
const StatCard: React.FC<StatCardProps> = ({ count, label, color }) => (
  <View style={{
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  }}>
    <AppText style={{ fontSize: 22, fontWeight: '700', color }}>{count}</AppText>
    <AppText style={{ fontSize: 11, color: colors.textSlate400, marginTop: 2, textAlign: 'center' }}>{label}</AppText>
  </View>
);

interface TicketCardProps {
  item: TicketEntity;
  onPress: (item: TicketEntity) => void;
}
const TicketCard: React.FC<TicketCardProps> = ({ item, onPress }) => {
  const status = STATUS_CONFIG[item.status];
  const priority = PRIORITY_CONFIG[item.priority];
  const ticketNumber = `TKT-${item.id.slice(-6).toUpperCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${ticketNumber}: ${item.businessName}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        backgroundColor: pressed ? `${colors.neonPurple}10` : colors.cardDark,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderDark,
      })}
    >
      {/* Top row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <AppText style={{ fontSize: 12, color: colors.textSlate400, fontWeight: '600' }}>{ticketNumber}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: priority.color }} />
          <AppText style={{ fontSize: 11, color: priority.color, fontWeight: '600' }}>{priority.label}</AppText>
        </View>
      </View>

      {/* Business name */}
      <AppText style={{ fontSize: 14, color: colors.white, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
        {item.businessName}
      </AppText>

      {/* Reason */}
      <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 8 }} numberOfLines={2}>
        {formatReason(item.reason)}
      </AppText>

      {/* Reporter */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: (item.status === 'IN_PROGRESS' || item.status === 'RESOLVED' || item.status === 'CLOSED') ? 6 : 10 }}>
        <MaterialCommunityIcons name="account-outline" size={14} color={colors.textSlate400} />
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.reporterName}</AppText>
      </View>

      {/* Handler — shown for IN_PROGRESS, RESOLVED, CLOSED */}
      {(item.status === 'IN_PROGRESS' || item.status === 'RESOLVED' || item.status === 'CLOSED') ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <MaterialCommunityIcons name="shield-account-outline" size={14} color={item.assignedToName ? '#F59E0B' : colors.textSlate400} />
          <AppText style={{ fontSize: 12, color: item.assignedToName ? '#F59E0B' : colors.textSlate400 }}>
            {item.assignedToName
              ? `${item.assignedToRole === 'admin' ? 'Admin' : 'Moderator'}: ${item.assignedToName}`
              : 'Handler: Not recorded'}
          </AppText>
        </View>
      ) : null}

      {/* Bottom row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: status.bg }}>
          <AppText style={{ fontSize: 11, color: status.color, fontWeight: '700' }}>{status.label}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSlate400} />
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>
            Updated {formatDate(item.updatedAt)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
interface TicketDetailModalProps {
  ticket: TicketEntity | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TicketStatus) => Promise<void>;
  onClaim: (id: string) => Promise<void>;
}
const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onUpdateStatus, onClaim }) => {
  const [updating, setUpdating] = useState(false);
  if (!ticket) return null;
  const status = STATUS_CONFIG[ticket.status];
  const priority = PRIORITY_CONFIG[ticket.priority];
  const ticketNumber = `TKT-${ticket.id.slice(-6).toUpperCase()}`;

  const handleStatus = async (s: TicketStatus) => {
    if (s === ticket.status) return;
    setUpdating(true);
    await onUpdateStatus(ticket.id, s);
    setUpdating(false);
    onClose();
  };

  const handleClaim = async () => {
    setUpdating(true);
    await onClaim(ticket.id);
    setUpdating(false);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent={Platform.OS !== 'web'}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.cardDark,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 40,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color={colors.neonPurple} />
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white }}>{ticketNumber}</AppText>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          {/* Info rows */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <InfoRow icon="store-outline" label="Business" value={ticket.businessName} />
            <InfoRow icon="flag-outline" label="Reason" value={formatReason(ticket.reason)} />
            <InfoRow icon="account-outline" label="Reported by" value={ticket.reporterName} />
            <InfoRow icon="calendar-outline" label="Submitted" value={formatDate(ticket.createdAt)} />
            {(ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <InfoRow
                  icon="shield-account-outline"
                  label={ticket.assignedToName
                    ? `Handled by ${ticket.assignedToRole === 'admin' ? 'Admin' : 'Moderator'}`
                    : 'Handled by'}
                  value={ticket.assignedToName ?? 'Not recorded'}
                  valueColor={ticket.assignedToName ? '#F59E0B' : undefined}
                />
                {!ticket.assignedToName && ticket.status === 'IN_PROGRESS' ? (
                  <Pressable
                    onPress={handleClaim}
                    accessibilityRole="button"
                    accessibilityLabel="Claim as handler"
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 16,
                      backgroundColor: '#F59E0B20',
                      borderWidth: 1,
                      borderColor: '#F59E0B',
                      marginLeft: 8,
                    }}
                  >
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>Claim</AppText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: status.bg }}>
                <AppText style={{ fontSize: 12, color: status.color, fontWeight: '700' }}>{status.label}</AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: priority.color }} />
                <AppText style={{ fontSize: 12, color: priority.color, fontWeight: '600' }}>{priority.label} priority</AppText>
              </View>
            </View>
          </View>

          {/* Status actions */}
          <AppText style={{ fontSize: 13, color: colors.textSlate400, marginBottom: 10 }}>
            Update status:
          </AppText>
          {updating ? (
            <ActivityIndicator color={colors.neonPurple} style={{ marginVertical: 16 }} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {STATUS_ACTIONS.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = ticket.status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => handleStatus(s)}
                    accessibilityRole="button"
                    accessibilityLabel={cfg.label}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: active ? cfg.bg : 'transparent',
                      borderWidth: 1.5,
                      borderColor: active ? cfg.color : 'rgba(255,255,255,0.15)',
                    }}
                  >
                    <AppText style={{ fontSize: 12, fontWeight: '600', color: active ? cfg.color : colors.textSlate400 }}>
                      {cfg.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

interface InfoRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, valueColor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
    <MaterialCommunityIcons name={icon} size={16} color={colors.textSlate400} style={{ marginTop: 1 }} />
    <View style={{ flex: 1 }}>
      <AppText style={{ fontSize: 11, color: colors.textSlate400, marginBottom: 1 }}>{label}</AppText>
      <AppText style={{ fontSize: 13, color: valueColor ?? colors.white }}>{value}</AppText>
    </View>
  </View>
);

// ── Support ticket helpers ─────────────────────────────────────────────────────
const SUPPORT_STATUS_CONFIG: Record<SupportTicketStatus, { label: string; color: string; bg: string }> = {
  OPEN:        { label: 'Open',        color: '#60A5FA', bg: '#1D4ED820' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#B4530920' },
  RESOLVED:    { label: 'Resolved',    color: '#34D399', bg: '#065F4620' },
  CLOSED:      { label: 'Closed',      color: colors.textSlate400, bg: `${colors.textSlate400}20` },
};

interface SupportTicketCardProps { item: SupportTicketEntity; onPress: (item: SupportTicketEntity) => void }
const SupportTicketCard: React.FC<SupportTicketCardProps> = ({ item, onPress }) => {
  const status = SUPPORT_STATUS_CONFIG[item.status];
  const ticketNumber = `SUP-${item.id.slice(-6).toUpperCase()}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Support ticket ${ticketNumber}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        backgroundColor: pressed ? `${colors.neonPurple}10` : colors.cardDark,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderDark,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <AppText style={{ fontSize: 12, color: colors.textSlate400, fontWeight: '600' }}>{ticketNumber}</AppText>
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: status.bg }}>
          <AppText style={{ fontSize: 11, color: status.color, fontWeight: '700' }}>{status.label}</AppText>
        </View>
      </View>
      <AppText style={{ fontSize: 14, color: colors.white, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
        {item.subject}
      </AppText>
      <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 8 }} numberOfLines={2}>
        {item.message}
      </AppText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="account-outline" size={13} color={colors.textSlate400} />
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.userName}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSlate400} />
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{formatDate(item.createdAt)}</AppText>
        </View>
      </View>
    </Pressable>
  );
};

const SUPPORT_STATUS_ACTIONS: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

interface SupportDetailModalProps {
  ticket: SupportTicketEntity | null;
  onClose: () => void;
  onReply: (ticketId: string, adminReply: string, status: string) => Promise<boolean>;
  isReplying: boolean;
}
const SupportDetailModal: React.FC<SupportDetailModalProps> = ({ ticket, onClose, onReply, isReplying }) => {
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus | null>(null);

  const handleOpen = useCallback(() => {
    setReplyText(ticket?.adminReply ?? '');
    setSelectedStatus(ticket?.status ?? null);
  }, [ticket]);

  React.useEffect(() => {
    if (ticket) handleOpen();
  }, [ticket, handleOpen]);

  if (!ticket) return null;
  const currentStatus = selectedStatus ?? ticket.status;
  const ticketNumber = `SUP-${ticket.id.slice(-6).toUpperCase()}`;

  const handleSubmit = async () => {
    const ok = await onReply(ticket.id, replyText.trim(), currentStatus);
    if (ok) onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent={Platform.OS !== 'web'}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.cardDark,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 40,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          maxHeight: '92%',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="lifebuoy" size={20} color={colors.neonPurple} />
              <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white }}>{ticketNumber}</AppText>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 14 }}>
              <InfoRow icon="text-box-outline" label="Subject" value={ticket.subject} />
              <InfoRow icon="shape-outline" label="Category" value={ticket.category} />
              <InfoRow icon="account-outline" label="User" value={`${ticket.userName} (${ticket.userEmail})`} />
              <InfoRow icon="calendar-outline" label="Submitted" value={formatDate(ticket.createdAt)} />
              <View>
                <AppText style={{ fontSize: 11, color: colors.textSlate400, marginBottom: 4 }}>Message</AppText>
                <AppText style={{ fontSize: 13, color: colors.white }}>{ticket.message}</AppText>
              </View>

              {/* Status update */}
              <View>
                <AppText style={{ fontSize: 13, color: colors.textSlate400, marginBottom: 8 }}>Update status:</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {SUPPORT_STATUS_ACTIONS.map((s) => {
                    const cfg = SUPPORT_STATUS_CONFIG[s];
                    const active = currentStatus === s;
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setSelectedStatus(s)}
                        accessibilityRole="button"
                        accessibilityLabel={cfg.label}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 7,
                          borderRadius: 20,
                          backgroundColor: active ? cfg.bg : 'transparent',
                          borderWidth: 1.5,
                          borderColor: active ? cfg.color : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        <AppText style={{ fontSize: 12, fontWeight: '600', color: active ? cfg.color : colors.textSlate400 }}>
                          {cfg.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Admin reply */}
              <View>
                <AppText style={{ fontSize: 13, color: colors.textSlate400, marginBottom: 8 }}>Reply to user:</AppText>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Write a reply..."
                  placeholderTextColor={colors.textSlate400}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  accessibilityLabel="Reply to user"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.12)',
                    padding: 12,
                    fontSize: 14,
                    color: colors.white,
                    minHeight: 100,
                  }}
                />
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={isReplying}
                accessibilityRole="button"
                accessibilityLabel="Save reply"
                style={{
                  backgroundColor: isReplying ? `${colors.neonPurple}40` : colors.neonPurple,
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                {isReplying ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>Save & Reply</AppText>
                )}
              </Pressable>

              <View style={{ height: 8 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdminTicketsScreen() {
  const { t } = useTranslation();
  const { tickets, isLoading, error, refresh, updateStatus, claimTicket } = useTickets();
  const { tickets: supportTickets, isLoading: supportLoading, isReplying, error: supportError, refresh: refreshSupport, replyToTicket } = useAdminSupportTickets();
  const { tickets: openReportsCount, supportTickets: openSupportCount } = useAdminBadgeStore();
  const [mainTab, setMainTab] = useState<'reports' | 'support'>('reports');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<TicketEntity | null>(null);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<SupportTicketEntity | null>(null);

  const filtered = useCallback(
    () => activeFilter === 'ALL' ? tickets : tickets.filter((tk) => tk.status === activeFilter),
    [activeFilter, tickets],
  );

  const openCount       = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount   = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedCount     = tickets.filter((t) => t.status === 'CLOSED').length;

  const handleUpdateStatus = async (id: string, status: TicketStatus) => {
    await updateStatus(id, status);
  };

  return (
    <ScreenLayout>
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdateStatus={handleUpdateStatus}
        onClaim={claimTicket}
      />
      <SupportDetailModal
        ticket={selectedSupportTicket}
        onClose={() => setSelectedSupportTicket(null)}
        onReply={replyToTicket}
        isReplying={isReplying}
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <AdminMenuButton />
        <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
          {t('admin.tickets.title')}
        </AppText>
        <Pressable
          onPress={mainTab === 'reports' ? refresh : refreshSupport}
          accessibilityRole="button"
          accessibilityLabel="Refresh"
          style={{ marginLeft: 'auto' }}
        >
          <MaterialCommunityIcons name="refresh" size={22} color={colors.textSlate400} />
        </Pressable>
      </View>

      {/* Main tab switcher */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
        {([
          { key: 'reports', label: 'Reports', badge: openReportsCount },
          { key: 'support', label: 'Support', badge: openSupportCount },
        ] as const).map(({ key, label, badge }) => {
          const active = mainTab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setMainTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 12,
                backgroundColor: active ? colors.neonPurple : colors.cardDark,
                borderWidth: 1,
                borderColor: active ? colors.neonPurple : colors.borderDark,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <AppText style={{ fontSize: 13, fontWeight: '600', color: active ? colors.white : colors.textSlate400 }}>
                {label}
              </AppText>
              {badge > 0 && (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: active ? '#FFFFFF' : '#EF4444',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <AppText style={{ fontSize: 10, fontWeight: '700', color: active ? '#EF4444' : '#FFFFFF', lineHeight: 13 }}>
                    {badge > 99 ? '99+' : String(badge)}
                  </AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {mainTab === 'reports' ? (
          <>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              <StatCard count={openCount}       label="Open"        color="#60A5FA" />
              <StatCard count={inProgressCount} label="In Progress" color="#F59E0B" />
              <StatCard count={resolvedCount}   label="Resolved"    color="#34D399" />
              <StatCard count={closedCount}     label="Closed"      color={colors.textSlate400} />
            </View>

            {/* Filter tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {FILTER_TABS.map((tab) => {
                  const active = activeFilter === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setActiveFilter(tab.key)}
                      accessibilityRole="button"
                      accessibilityLabel={tab.label}
                      accessibilityState={{ selected: active }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 20,
                        backgroundColor: active ? colors.neonPurple : colors.cardDark,
                        borderWidth: 1,
                        borderColor: active ? colors.neonPurple : colors.borderDark,
                      }}
                    >
                      <AppText style={{ fontSize: 12, fontWeight: '600', color: active ? colors.white : colors.textSlate400 }}>
                        {tab.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {isLoading ? (
              <ActivityIndicator color={colors.neonPurple} style={{ marginTop: 60 }} />
            ) : error ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
                <AppText style={{ color: colors.textSlate400, marginTop: 12, fontSize: 14 }}>{error}</AppText>
                <Pressable onPress={refresh} accessibilityRole="button" style={{ marginTop: 16 }}>
                  <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>Retry</AppText>
                </Pressable>
              </View>
            ) : filtered().length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="ticket-outline" size={48} color={colors.textSlate400} />
                <AppText style={{ color: colors.textSlate400, marginTop: 12, fontSize: 14 }}>
                  {t('admin.tickets.empty')}
                </AppText>
              </View>
            ) : (
              filtered().map((item) => (
                <TicketCard key={item.id} item={item} onPress={setSelectedTicket} />
              ))
            )}
          </>
        ) : (
          /* Support tickets tab */
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              <StatCard count={supportTickets.filter((t) => t.status === 'OPEN').length}        label="Open"        color="#60A5FA" />
              <StatCard count={supportTickets.filter((t) => t.status === 'IN_PROGRESS').length} label="In Progress" color="#F59E0B" />
              <StatCard count={supportTickets.filter((t) => t.status === 'RESOLVED').length}    label="Resolved"    color="#34D399" />
              <StatCard count={supportTickets.filter((t) => t.status === 'CLOSED').length}      label="Closed"      color={colors.textSlate400} />
            </View>

            {supportLoading ? (
              <ActivityIndicator color={colors.neonPurple} style={{ marginTop: 60 }} />
            ) : supportError ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
                <AppText style={{ color: colors.textSlate400, marginTop: 12, fontSize: 14 }}>{supportError}</AppText>
                <Pressable onPress={refreshSupport} accessibilityRole="button" style={{ marginTop: 16 }}>
                  <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>Retry</AppText>
                </Pressable>
              </View>
            ) : supportTickets.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="lifebuoy" size={48} color={colors.textSlate400} />
                <AppText style={{ color: colors.textSlate400, marginTop: 12, fontSize: 14 }}>
                  No support tickets yet
                </AppText>
              </View>
            ) : (
              supportTickets.map((item) => (
                <SupportTicketCard key={item.id} item={item} onPress={setSelectedSupportTicket} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
