import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { auth } from '@/core/firebase/firebaseConfig';

// TODO: Use container use cases when wired in DI container
import { NotificationRemoteDataSourceImpl } from '@/data/notifications/datasources/notificationRemoteDataSource';
import { NotificationRepositoryImpl } from '@/data/notifications/repositories/notificationRepositoryImpl';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
import { GetNotificationsUseCase } from '@/domain/notifications/usecases/getNotificationsUseCase';
import { MarkNotificationReadUseCase } from '@/domain/notifications/usecases/markNotificationReadUseCase';

const remote = new NotificationRemoteDataSourceImpl();
const network = new NetworkInfoImpl();
const repo = new NotificationRepositoryImpl(remote, network);
const getNotificationsUseCase = new GetNotificationsUseCase(repo);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(repo);

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

  const loadNotifications = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    setError(null);

    const result = await getNotificationsUseCase.execute(userId);

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
  }, [setLoading, setError, setNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      markRead(notificationId);

      const result = await markNotificationReadUseCase.execute(notificationId);

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
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Optimistic update
    markAllReadInStore();

    const result = await repo.markAllAsRead(userId);

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
  }, [markAllReadInStore, setError, loadNotifications]);

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
