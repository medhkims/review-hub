import React from 'react';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import HomeScreen from '@/presentation/home/screens/HomeScreen';
import AdminHomeScreen from '@/presentation/admin/screens/AdminHomeScreen';
import ModeratorHomeScreen from '@/presentation/moderator/screens/ModeratorHomeScreen';
import BusinessOwnerHomeScreen from '@/presentation/businessOwner/screens/BusinessOwnerHomeScreen';

export default function FeedIndex() {
  const { role } = useRoleStore();

  switch (role) {
    case 'admin':
      return <AdminHomeScreen />;
    case 'moderator':
      return <ModeratorHomeScreen />;
    case 'business_owner':
      return <BusinessOwnerHomeScreen />;
    default:
      return <HomeScreen />;
  }
}
