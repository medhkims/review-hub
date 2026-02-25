import { useCallback, useEffect } from 'react';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents } from '@/core/analytics/analyticsKeys';

export const useBusinessDashboard = () => {
  const { business, isLoading, error, setBusiness, setLoading, setError } = useBusinessOwnerStore();
  const user = useAuthStore((s) => s.user);

  const loadBusiness = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    const result = await container.getOwnerBusinessUseCase.execute(user.id);
    result.fold(
      (failure) => setError(failure.message),
      (entity) => {
        setBusiness(entity);
        AnalyticsHelper.sendEvent(AnalyticsEvents.LOAD_BUSINESS_DASHBOARD);
        setLoading(false);
      },
    );
  }, [user?.id]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  return {
    business,
    isLoading,
    isProfileSetup: business !== null,
    error,
    refresh: loadBusiness,
  };
};
