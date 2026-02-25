import { useCallback, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { UserRole } from '@/domain/profile/entities/userRole';

// Mock data for the dashboard until backend queries are implemented
const MOCK_STATS = {
  totalUsers: 156,
  byRole: {
    simple_user: 142,
    business_owner: 10,
    moderator: 3,
    admin: 1,
  },
  recentSignups: [
    { id: '1', name: 'Ahmed Ben Ali', email: 'ahmed@example.com', role: 'simple_user' as UserRole, date: '2 hours ago' },
    { id: '2', name: 'Fatma Trabelsi', email: 'fatma@example.com', role: 'simple_user' as UserRole, date: '5 hours ago' },
    { id: '3', name: 'Mohamed Souissi', email: 'mohamed@example.com', role: 'business_owner' as UserRole, date: '1 day ago' },
  ],
};

export const useAdminDashboard = () => {
  const { isLoading, error, setLoading, setTotalUsers } = useAdminStore();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with real Firestore queries
    setTotalUsers(MOCK_STATS.totalUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    totalUsers: MOCK_STATS.totalUsers,
    usersByRole: MOCK_STATS.byRole,
    recentSignups: MOCK_STATS.recentSignups,
    isLoading,
    error,
    refresh: loadDashboard,
  };
};
