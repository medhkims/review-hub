import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';

/**
 * Returns true if the current user is a guest (anonymous, under 13).
 * Guest users can browse but cannot create content or have a profile.
 */
export const useIsGuest = (): boolean => {
  const role = useRoleStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  // Guest role explicitly set during anonymous sign-in
  if (role === 'guest') return true;

  // Anonymous Firebase user (no email)
  if (user && !user.email) return true;

  return false;
};
