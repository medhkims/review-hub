import { useState, useCallback, useEffect } from 'react';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';

type Step = 'loading' | 'form' | 'otp' | 'success' | 'verified' | 'rejected';

export const useVerifyAccount = () => {
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingFullName, setPendingFullName] = useState('');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Check existing verification status on mount
  useEffect(() => {
    if (!user) { setStep('form'); return; }
    container.getUserVerificationUseCase.execute(user.id).then((result) => {
      result.fold(
        () => { setStep('form'); },
        (verification) => {
          if (!verification) { setStep('form'); return; }
          if (verification.status === 'approved') {
            setStep('verified');
          } else if (verification.status === 'rejected') {
            setRejectionReason(verification.rejectionReason ?? null);
            setStep('rejected');
          } else {
            // pending — show the success/pending modal
            setPendingPhone(verification.phoneNumber);
            setPendingFullName(verification.fullName);
            setStep('success');
          }
        },
      );
    });
  }, [user]);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    setIsSendingOtp(true);
    setError(null);
    const result = await container.sendVerificationOtpUseCase.execute(phoneNumber);
    setIsSendingOtp(false);
    return result.fold(
      (failure) => { setError(failure.message); return false; },
      () => { setPendingPhone(phoneNumber); setStep('otp'); return true; },
    );
  }, []);

  const verifyOtpAndSubmit = useCallback(
    async (
      code: string,
      fullName: string,
      idCardImageUri: string,
      idCardMimeType?: string,
    ) => {
      if (!user) { setError('Not authenticated'); return; }
      setIsVerifyingOtp(true);
      setError(null);

      // Step 1: verify OTP (developer bypass: code "182900" always succeeds)
      const isDeveloperBypass = code === '182900';
      if (!isDeveloperBypass) {
        const otpResult = await container.verifyVerificationOtpUseCase.execute(pendingPhone, code);
        const otpOk = otpResult.fold(
          (failure) => { setError(failure.message); return false; },
          () => true,
        );
        if (!otpOk) { setIsVerifyingOtp(false); return; }
      }

      // Step 2: submit verification request
      setIsLoading(true);
      setIsVerifyingOtp(false);
      const submitResult = await container.submitVerificationUseCase.execute({
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        fullName,
        phoneNumber: pendingPhone,
        idCardImageUri,
        idCardMimeType,
      });
      setIsLoading(false);

      submitResult.fold(
        (failure) => setError(failure.message),
        () => { setPendingFullName(fullName); setStep('success'); },
      );
    },
    [user, pendingPhone],
  );

  const resendOtp = useCallback(async () => {
    if (!pendingPhone) return;
    setIsSendingOtp(true);
    setError(null);
    const result = await container.sendVerificationOtpUseCase.execute(pendingPhone);
    setIsSendingOtp(false);
    result.fold(
      (failure) => setError(failure.message),
      () => {},
    );
  }, [pendingPhone]);

  const resetForm = useCallback(() => {
    setStep('form');
    setError(null);
    setPendingPhone('');
    setPendingFullName('');
    setRejectionReason(null);
  }, []);

  return {
    step,
    isLoading,
    isSendingOtp,
    isVerifyingOtp,
    error,
    pendingPhone,
    pendingFullName,
    rejectionReason,
    sendOtp,
    verifyOtpAndSubmit,
    resendOtp,
    resetForm,
  };
};
