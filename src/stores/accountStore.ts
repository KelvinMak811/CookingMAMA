import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AccountId } from "@/lib/accounts";
import { ACCOUNTS, isAccountId } from "@/lib/accounts";
import { migrateLegacyData, STORAGE_KEY_CURRENT_USER } from "@/lib/storage";

interface AccountState {
  currentUserId: AccountId | null;
  viewingUserId: AccountId | null;
  hydrated: boolean;
  setCurrentUser: (userId: AccountId) => void;
  setViewingUser: (userId: AccountId) => void;
  clearCurrentUser: () => void;
  canEditViewingUser: () => boolean;
}

function normalizeRehydratedState(state?: Pick<AccountState, "currentUserId" | "viewingUserId">) {
  if (state?.currentUserId && !state.viewingUserId) {
    useAccountStore.setState({ viewingUserId: state.currentUserId });
  }
}

const accountStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      if (isAccountId(raw)) {
        return JSON.stringify({
          state: { currentUserId: raw, viewingUserId: raw },
          version: 0,
        });
      }
      return raw;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* private browsing / storage blocked */
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      viewingUserId: null,
      hydrated: false,

      setCurrentUser: (userId) => {
        if (!ACCOUNTS[userId]) return;
        migrateLegacyData(userId);
        set({ currentUserId: userId, viewingUserId: userId });
      },

      setViewingUser: (userId) => {
        if (!ACCOUNTS[userId]) return;
        set({ viewingUserId: userId });
      },

      clearCurrentUser: () => set({ currentUserId: null, viewingUserId: null }),

      canEditViewingUser: () => {
        const { currentUserId, viewingUserId } = get();
        return Boolean(currentUserId && viewingUserId && currentUserId === viewingUserId);
      },
    }),
    {
      name: STORAGE_KEY_CURRENT_USER,
      storage: createJSONStorage(() => accountStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        viewingUserId: state.viewingUserId,
      }),
      onRehydrateStorage: () => (state) => {
        normalizeRehydratedState(state);
        useAccountStore.setState({ hydrated: true });
      },
    }
  )
);

export function getCurrentUserIdSync(): AccountId | null {
  return useAccountStore.getState().currentUserId;
}
