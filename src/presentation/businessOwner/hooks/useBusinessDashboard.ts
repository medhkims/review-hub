import { useCallback, useEffect } from 'react';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';

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
