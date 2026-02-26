import { create } from 'zustand';
import { NotificationEntity } from '@/domain/notifications/entities/notificationEntity';

interface NotificationState {
  notifications: NotificationEntity[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setNotifications: (notifications: NotificationEntity[]) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      error: null,
    }),
  markRead: (notificationId) =>
    set((state) => {
      const alreadyRead = state.notifications.find(
        (n) => n.id === notificationId,
      )?.isRead;

      return {
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        ),
        unreadCount: alreadyRead
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({ notifications: [], unreadCount: 0, isLoading: false, error: null }),
}));
