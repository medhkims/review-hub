import { useEffect } from 'react';
import { container } from '@/core/di/container';
import { useAdminBadgeStore } from '../store/adminBadgeStore';

export interface AdminBadgeCounts {
  tickets: number;
  supportTickets: number;
  verification: number;
  chat: number;
}

export const useAdminBadges = (): AdminBadgeCounts => {
  const { tickets, supportTickets, verification, chat, setBadges } = useAdminBadgeStore();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [
        ticketsResult,
        supportTicketsResult,
        pendingBusinessesResult,
        pendingReviewsResult,
        pendingVerificationsResult,
        conversationsResult,
      ] = await Promise.all([
        container.getTicketsUseCase.execute(),
        container.getAllSupportTicketsUseCase.execute(),
        container.getPendingBusinessesUseCase.execute(),
        container.getPendingReviewsUseCase.execute(),
        container.getPendingVerificationsUseCase.execute(),
        container.getConversationsUseCase.execute(),
      ]);

      if (cancelled) return;

      let newTickets = 0;
      ticketsResult.fold(
        () => {},
        (data) => { newTickets = data.filter((t) => t.status === 'OPEN').length; },
      );

      let newSupportTickets = 0;
      supportTicketsResult.fold(
        () => {},
        (data) => { newSupportTickets = data.filter((t) => t.status === 'OPEN').length; },
      );

      let newVerification = 0;
      pendingBusinessesResult.fold(
        () => {},
        (data) => { newVerification += data.length; },
      );
      pendingReviewsResult.fold(
        () => {},
        (data) => { newVerification += data.length; },
      );
      pendingVerificationsResult.fold(
        () => {},
        (data) => { newVerification += data.length; },
      );

      let newChat = 0;
      conversationsResult.fold(
        () => {},
        (data) => { newChat = data.filter((c) => c.unreadCount > 0).length; },
      );

      setBadges({ tickets: newTickets, supportTickets: newSupportTickets, verification: newVerification, chat: newChat });
    };

    load();
    // Auto-refresh every 60 seconds so admin always sees up-to-date counts
    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setBadges]);

  return { tickets, supportTickets, verification, chat };
};
