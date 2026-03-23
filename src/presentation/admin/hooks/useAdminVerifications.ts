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
  const [isExtractingCin, setIsExtractingCin] = useState(false);
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

  const approve = useCallback(async (verification: VerificationEntity) => {
    if (!user) return;
    setIsUpdating(verification.id);
    const result = await container.updateVerificationStatusUseCase.execute({
      id: verification.id,
      status: 'approved',
      reviewedBy: user.id,
      userId: verification.userId,
      userName: verification.userName,
    });
    setIsUpdating(null);
    result.fold(
      (failure) => setError(failure.message),
      () => setVerifications((prev) => prev.filter((v) => v.id !== verification.id)),
    );
  }, [user]);

  const reject = useCallback(async (verification: VerificationEntity, reason: string) => {
    if (!user) return;
    setIsUpdating(verification.id);
    const result = await container.updateVerificationStatusUseCase.execute({
      id: verification.id,
      status: 'rejected',
      reviewedBy: user.id,
      userId: verification.userId,
      userName: verification.userName,
      rejectionReason: reason,
    });
    setIsUpdating(null);
    result.fold(
      (failure) => setError(failure.message),
      () => setVerifications((prev) => prev.filter((v) => v.id !== verification.id)),
    );
  }, [user]);

  const extractCin = useCallback(async (verification: VerificationEntity): Promise<string | null> => {
    setIsExtractingCin(true);
    setError(null);
    const result = await container.extractAndSaveCinUseCase.execute(verification.id);
    setIsExtractingCin(false);
    return result.fold(
      (failure) => { setError(failure.message); return null; },
      (cinNumber) => {
        // Update the local list so the UI refreshes immediately
        setVerifications((prev) =>
          prev.map((v) => v.id === verification.id ? { ...v, cinNumber } : v),
        );
        return cinNumber;
      },
    );
  }, []);

  return {
    activeTab,
    switchTab,
    verifications,
    isLoading,
    isUpdating,
    isExtractingCin,
    error,
    load: () => load(activeTab),
    approve,
    reject,
    extractCin,
  };
};
