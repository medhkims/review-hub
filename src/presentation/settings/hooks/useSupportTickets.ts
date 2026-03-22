import { useState, useCallback, useEffect } from 'react';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { SupportTicketEntity } from '@/domain/support/entities/supportTicketEntity';

export const useSupportTickets = () => {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicketEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    const result = await container.getUserSupportTicketsUseCase.execute(user.id);
    result.fold(
      (failure) => setError(failure.message),
      (data) => setTickets(data),
    );
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const submitTicket = useCallback(
    async (subject: string, message: string, category: string) => {
      if (!user) return;
      setIsSubmitting(true);
      setError(null);
      setSubmitSuccess(false);
      const result = await container.submitSupportTicketUseCase.execute(
        subject,
        message,
        category,
        user.id,
        user.email,
        user.displayName,
      );
      result.fold(
        (failure) => setError(failure.message),
        (ticket) => {
          setTickets((prev) => [ticket, ...prev]);
          setSubmitSuccess(true);
        },
      );
      setIsSubmitting(false);
    },
    [user],
  );

  const clearSubmitSuccess = useCallback(() => setSubmitSuccess(false), []);

  return {
    tickets,
    isLoading,
    isSubmitting,
    error,
    submitSuccess,
    submitTicket,
    refresh: fetchTickets,
    clearSubmitSuccess,
  };
};
