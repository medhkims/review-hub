import { useState, useEffect, useCallback } from 'react';
import { container } from '@/core/di/container';
import { TicketEntity, TicketStatus } from '@/domain/ticket/entities/ticketEntity';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useRoleStore } from '@/presentation/auth/store/roleStore';

export const useTickets = () => {
  const [tickets, setTickets] = useState<TicketEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const role = useRoleStore((s) => s.role);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getTicketsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setTickets(data),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
    const assignee =
      status === 'IN_PROGRESS' && user && (role === 'admin' || role === 'moderator')
        ? { id: user.id, name: user.displayName, role: role as 'admin' | 'moderator' }
        : undefined;

    const result = await container.updateTicketStatusUseCase.execute(ticketId, status, assignee);
    result.fold(
      (failure) => setError(failure.message),
      () => setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          if (status === 'IN_PROGRESS') {
            return { ...t, status, updatedAt: new Date(), assignedToId: assignee?.id, assignedToName: assignee?.name, assignedToRole: assignee?.role };
          }
          if (status === 'OPEN') {
            return { ...t, status, updatedAt: new Date(), assignedToId: undefined, assignedToName: undefined, assignedToRole: undefined };
          }
          // RESOLVED / CLOSED — keep existing handler
          return { ...t, status, updatedAt: new Date() };
        })
      ),
    );
  }, [user, role]);

  // Claim an already-IN_PROGRESS ticket that has no handler recorded yet
  const claimTicket = useCallback(async (ticketId: string) => {
    if (!user || (role !== 'admin' && role !== 'moderator')) return;
    const assignee = { id: user.id, name: user.displayName, role: role as 'admin' | 'moderator' };
    const result = await container.updateTicketStatusUseCase.execute(ticketId, 'IN_PROGRESS', assignee);
    result.fold(
      (failure) => setError(failure.message),
      () => setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, updatedAt: new Date(), assignedToId: assignee.id, assignedToName: assignee.name, assignedToRole: assignee.role }
            : t
        )
      ),
    );
  }, [user, role]);

  return { tickets, isLoading, error, refresh: load, updateStatus, claimTicket };
};
