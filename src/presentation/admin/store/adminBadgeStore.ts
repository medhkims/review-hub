import { create } from 'zustand';

export interface AdminBadgeCounts {
  tickets: number;
  supportTickets: number;
  verification: number;
  chat: number;
}

interface AdminBadgeState extends AdminBadgeCounts {
  setBadges: (badges: AdminBadgeCounts) => void;
}

export const useAdminBadgeStore = create<AdminBadgeState>((set) => ({
  tickets: 0,
  supportTickets: 0,
  verification: 0,
  chat: 0,
  setBadges: (badges) => set(badges),
}));
