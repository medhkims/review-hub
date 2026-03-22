import { useEffect, useState } from 'react';
import { container } from '@/core/di/container';

export interface AdminBadgeCounts {
  tickets: number;
  verification: number;
  chat: number;
}

export const useAdminBadges = () => {
  const [badges, setBadges] = useState<AdminBadgeCounts>({ tickets: 0, verification: 0, chat: 0 });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [ticketsResult, pendingBusinessesResult, pendingReviewsResult, conversationsResult] =
        await Promise.all([
          container.getTicketsUseCase.execute(),
          container.getPendingBusinessesUseCase.execute(),
          container.getPendingReviewsUseCase.execute(),
          container.getConversationsUseCase.execute(),
        ]);

      if (cancelled) return;

      let tickets = 0;
      ticketsResult.fold(
        () => {},
        (data) => { tickets = data.filter((t) => t.status === 'OPEN').length; },
      );

      let verification = 0;
      pendingBusinessesResult.fold(
        () => {},
        (data) => { verification += data.length; },
      );
      pendingReviewsResult.fold(
        () => {},
        (data) => { verification += data.length; },
      );

      let chat = 0;
      conversationsResult.fold(
        () => {},
        (data) => { chat = data.filter((c) => c.unreadCount > 0).length; },
      );

      setBadges({ tickets, verification, chat });
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return badges;
};
