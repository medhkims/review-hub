import { useState, useEffect, useCallback } from 'react';
import { container } from '@/core/di/container';
import { SupportTicketEntity } from '@/domain/support/entities/supportTicketEntity';

export const useAdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicketEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getAllSupportTicketsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setTickets(data),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tickets, isLoading, error, refresh: load };
};
