import { create } from 'zustand';
import { UserRole } from '@/domain/profile/entities/userRole';

interface RoleState {
  role: UserRole | null;
  isRoleLoaded: boolean;
  setRole: (role: UserRole | null) => void;
  reset: () => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: null,
  isRoleLoaded: false,
  setRole: (role) => set({ role, isRoleLoaded: true }),
  reset: () => set({ role: null, isRoleLoaded: false }),
}));
