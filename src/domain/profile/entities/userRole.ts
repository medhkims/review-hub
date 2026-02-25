export const USER_ROLES = ['admin', 'moderator', 'simple_user', 'business_owner'] as const;
export type UserRole = typeof USER_ROLES[number];

export const DEFAULT_ROLE: UserRole = 'simple_user';

export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}
