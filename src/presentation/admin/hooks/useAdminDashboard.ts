import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAdminStore } from '../store/adminStore';
import { container } from '@/core/di/container';

export const useAdminDashboard = () => {
  const { stats, isLoading, error, setStats, setLoading, setError } = useAdminStore();

  const load = useCallback(async () => {
    setLoading(true);
    const result = await container.getAdminDashboardStatsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setStats(data),
    );
    setLoading(false);
  }, [setLoading, setError, setStats]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { stats, isLoading, error, refresh: load };
};
