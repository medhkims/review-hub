import { useState, useCallback, useEffect } from 'react';
import { container } from '@/core/di/container';
import { VerificationEntity, VerificationStatus } from '@/domain/verification/entities/verificationEntity';
import { useAuthStore } from '@/presentation/auth/store/authStore';

export type VerificationTab = 'pending' | 'approved' | 'rejected';

export const useAdminVerifications = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<VerificationTab>('pending');
  const [verifications, setVerifications] = useState<VerificationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (tab: VerificationTab = activeTab) => {
    setIsLoading(true);
    setError(null);
    const result = await container.getVerificationsByStatusUseCase.execute(tab as VerificationStatus);
    setIsLoading(false);
    result.fold(
      (failure) => setError(failure.message),
      (items) => setVerifications(items),
    );
  }, [activeTab]);

  useEffect(() => { load(activeTab); }, [activeTab]);

  const switchTab = useCallback((tab: VerificationTab) => {
    setActiveTab(tab);
    setVerifications([]);
  }, []);

  const approve = useCallback(async (id: string) => {
    if (!user) return;
    setIsUpdating(id);
    const result = await container.updateVerificationStatusUseCase.execute(id, 'approved', user.id);
    setIsUpdating(null);
    result.fold(
      (failure) => setError(failure.message),
      () => setVerifications((prev) => prev.filter((v) => v.id !== id)),
    );
  }, [user]);

  const reject = useCallback(async (id: string, reason: string) => {
    if (!user) return;
    setIsUpdating(id);
    const result = await container.updateVerificationStatusUseCase.execute(id, 'rejected', user.id, reason);
    setIsUpdating(null);
    result.fold(
      (failure) => setError(failure.message),
      () => setVerifications((prev) => prev.filter((v) => v.id !== id)),
    );
  }, [user]);

  return {
    activeTab,
    switchTab,
    verifications,
    isLoading,
    isUpdating,
    error,
    load: () => load(activeTab),
    approve,
    reject,
  };
};
