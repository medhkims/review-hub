import { useCallback, useEffect, useState } from 'react';
import { container } from '@/core/di/container';
import { useModeratorStore } from '../store/moderatorStore';

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export const useModeratorDashboard = () => {
  const { isLoading, error, setLoading, setPendingCount, setFlaggedCount, setError } = useModeratorStore();
  const [recentActivity, setRecentActivity] = useState<{ id: string; action: string; target: string; time: string }[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [flaggedContent, setFlaggedContent] = useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await container.adminInsightsDataSource.fetchModeratorDashboard();
      setPendingReviews(data.pendingReviews);
      setFlaggedContent(data.flaggedContent);
      setPendingCount(data.pendingReviews);
      setFlaggedCount(data.flaggedContent);
      setRecentActivity(
        data.recentActivity.map(a => ({
          id: a.id,
          action: a.action,
          target: a.target,
          time: timeAgo(a.time),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPendingCount, setFlaggedCount]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    pendingReviews,
    flaggedContent,
    recentActivity,
    isLoading,
    error,
    refresh: loadDashboard,
  };
};
