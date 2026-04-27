import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    markRead,
    markAllRead: markAllReadInStore,
    setLoading,
    setError,
  } = useNotificationStore();

  const { user } = useAuthStore();

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const result = await container.getNotificationsUseCase.execute(user.id);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (fetchedNotifications) => {
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
    );
  }, [user?.id, setLoading, setError, setNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      markRead(notificationId);

      const result = await container.markNotificationReadUseCase.execute(notificationId);

      result.fold(
        (failure) => {
          setError(failure.message);
          // Rollback: re-fetch notifications on failure
          loadNotifications();
        },
        () => {
          // Success — store is already updated optimistically
        },
      );
    },
    [markRead, setError, loadNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    // Optimistic update
    markAllReadInStore();

    const result = await container.notificationRepository.markAllAsRead(user.id);

    result.fold(
      (failure) => {
        setError(failure.message);
        // Rollback: re-fetch notifications on failure
        loadNotifications();
      },
      () => {
        // Success — store is already updated optimistically
      },
    );
  }, [user?.id, markAllReadInStore, setError, loadNotifications]);

  const refresh = useCallback(() => {
    return loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
};
