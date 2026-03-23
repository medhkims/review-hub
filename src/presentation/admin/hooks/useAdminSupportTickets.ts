import { useState, useEffect, useCallback } from 'react';
import { container } from '@/core/di/container';
import { SupportTicketEntity } from '@/domain/support/entities/supportTicketEntity';

export const useAdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicketEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
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

  const replyToTicket = useCallback(async (
    ticketId: string,
    adminReply: string,
    status: string,
  ): Promise<boolean> => {
    setIsReplying(true);
    const ticket = tickets.find((t) => t.id === ticketId);
    const result = await container.replyToSupportTicketUseCase.execute(ticketId, adminReply, status, {
      userId: ticket?.userId ?? '',
      subject: ticket?.subject ?? '',
    });
    setIsReplying(false);
    return result.fold(
      (failure) => { setError(failure.message); return false; },
      () => {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, adminReply, status: status as SupportTicketEntity['status'], updatedAt: new Date() }
              : t,
          ),
        );
        return true;
      },
    );
  }, [tickets]);

  return { tickets, isLoading, isReplying, error, refresh: load, replyToTicket };
};
