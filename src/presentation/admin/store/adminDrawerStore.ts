import { create } from 'zustand';

interface AdminDrawerState {
  isOpen: boolean;
  activeKey: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setActiveKey: (key: string) => void;
}

export const useAdminDrawerStore = create<AdminDrawerState>((set) => ({
  isOpen: false,
  activeKey: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveKey: (key) => set({ activeKey: key }),
}));
