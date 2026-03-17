import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_accounts_v2';

export interface SavedAccount {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  type: 'user' | 'business' | 'moderator' | 'admin';
  provider: 'email' | 'google' | 'facebook' | 'apple';
}

interface SavedAccountsState {
  accounts: SavedAccount[];
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (account: SavedAccount) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSavedAccountsStore = create<SavedAccountsState>((set, get) => ({
  accounts: [],
  isLoaded: false,

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const raw: SavedAccount[] = json ? JSON.parse(json) : [];
      // Deduplicate by email — keep the highest-privilege role entry
      const roleRank: Record<SavedAccount['type'], number> = { admin: 4, moderator: 3, business: 2, user: 1 };
      const byEmail = new Map<string, SavedAccount>();
      for (const a of raw) {
        const existing = byEmail.get(a.email);
        if (!existing || roleRank[a.type] > roleRank[existing.type]) {
          byEmail.set(a.email, a);
        }
      }
      const accounts = Array.from(byEmail.values());
      if (accounts.length !== raw.length) {
        // Persist the cleaned-up list
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      }
      set({ accounts, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async (account: SavedAccount) => {
    // If not loaded yet, read from storage first to avoid overwriting other saved accounts
    if (!get().isLoaded) {
      await get().load();
    }
    const existing = get().accounts;
    // Deduplicate by id OR email — same person may have been saved under a different id/role
    const isSame = (a: SavedAccount) => a.id === account.id || a.email === account.email;
    // Replace the first matching entry, drop any remaining duplicates, append if new
    let replaced = false;
    const deduped = existing.reduce<SavedAccount[]>((acc, a) => {
      if (isSame(a)) {
        if (!replaced) { acc.push(account); replaced = true; }
        // skip further duplicates of the same account
      } else {
        acc.push(a);
      }
      return acc;
    }, []);
    const updated = replaced ? deduped : [...existing, account];
    set({ accounts: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },

  remove: async (id: string) => {
    const updated = get().accounts.filter((a) => a.id !== id);
    set({ accounts: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },
}));
