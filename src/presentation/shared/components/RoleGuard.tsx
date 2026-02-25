import React from 'react';
import { View } from 'react-native';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { UserRole } from '@/domain/profile/entities/userRole';
import { AppText } from './ui/AppText';
import { colors } from '@/core/theme';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { role } = useRoleStore();

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.midnight }}
        accessibilityRole="alert"
      >
        <AppText className="text-lg font-semibold text-white mb-2">
          Access Denied
        </AppText>
        <AppText className="text-sm text-slate-400 text-center">
          You do not have permission to view this page.
        </AppText>
      </View>
    );
  }

  return <>{children}</>;
};
