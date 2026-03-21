import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { useTickets } from '../hooks/useTickets';
import { TicketEntity, TicketStatus, TicketPriority } from '@/domain/ticket/entities/ticketEntity';

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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: item.status === 'IN_PROGRESS' && item.assignedToName ? 6 : 10 }}>
        <MaterialCommunityIcons name="account-outline" size={14} color={colors.textSlate400} />
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.reporterName}</AppText>
      </View>

      {/* Assignee — only shown when IN_PROGRESS */}
      {item.status === 'IN_PROGRESS' && item.assignedToName ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <MaterialCommunityIcons name="shield-account-outline" size={14} color="#F59E0B" />
          <AppText style={{ fontSize: 12, color: '#F59E0B' }}>
            {item.assignedToRole === 'admin' ? 'Admin' : 'Moderator'}: {item.assignedToName}
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
}
const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onUpdateStatus }) => {
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

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
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

interface InfoRowProps { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
    <MaterialCommunityIcons name={icon} size={16} color={colors.textSlate400} style={{ marginTop: 1 }} />
    <View style={{ flex: 1 }}>
      <AppText style={{ fontSize: 11, color: colors.textSlate400, marginBottom: 1 }}>{label}</AppText>
      <AppText style={{ fontSize: 13, color: colors.white }}>{value}</AppText>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdminTicketsScreen() {
  const { t } = useTranslation();
  const { tickets, isLoading, error, refresh, updateStatus } = useTickets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<TicketEntity | null>(null);

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
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <AdminMenuButton />
        <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
          {t('admin.tickets.title')}
        </AppText>
        <Pressable
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh"
          style={{ marginLeft: 'auto' }}
        >
          <MaterialCommunityIcons name="refresh" size={22} color={colors.textSlate400} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
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

        {/* Content */}
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
      </ScrollView>
    </ScreenLayout>
  );
}
