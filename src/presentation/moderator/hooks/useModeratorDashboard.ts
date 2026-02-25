import { useCallback, useEffect } from 'react';
import { useModeratorStore } from '../store/moderatorStore';

// Mock data until backend queries are implemented
const MOCK_DATA = {
  pendingReviews: 12,
  flaggedContent: 3,
  recentActivity: [
    { id: '1', action: 'Review approved', target: 'Cafe Tunis', time: '30 min ago' },
    { id: '2', action: 'Content flagged', target: 'Spam review on Hotel Sousse', time: '2 hours ago' },
    { id: '3', action: 'Review rejected', target: 'Fake listing report', time: '5 hours ago' },
    { id: '4', action: 'User warning sent', target: 'user123@email.com', time: '1 day ago' },
  ],
};

export const useModeratorDashboard = () => {
  const { isLoading, error, setLoading, setPendingCount, setFlaggedCount } = useModeratorStore();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with real Firestore queries
    setPendingCount(MOCK_DATA.pendingReviews);
    setFlaggedCount(MOCK_DATA.flaggedContent);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    pendingReviews: MOCK_DATA.pendingReviews,
    flaggedContent: MOCK_DATA.flaggedContent,
    recentActivity: MOCK_DATA.recentActivity,
    isLoading,
    error,
    refresh: loadDashboard,
  };
};
