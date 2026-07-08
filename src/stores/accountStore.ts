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

function readLegacyUserId(): AccountId | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!raw) return null;
  if (isAccountId(raw)) return raw;
  try {
    const parsed = JSON.parse(raw) as { state?: { currentUserId?: string } };
    const id = parsed?.state?.currentUserId;
    return isAccountId(id) ? id : null;
  } catch {
    return null;
  }
}

const accountStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);
    if (!raw) {
      const legacy = readLegacyUserId();
      if (!legacy) return null;
      return JSON.stringify({
        state: { currentUserId: legacy, viewingUserId: legacy },
        version: 0,
      });
    }
    if (isAccountId(raw)) {
      return JSON.stringify({
        state: { currentUserId: raw, viewingUserId: raw },
        version: 0,
      });
    }
    return raw;
  },
  setItem: (name: string, value: string): void => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
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
        if (state?.currentUserId && !state.viewingUserId) {
          state.viewingUserId = state.currentUserId;
        }
        useAccountStore.setState({ hydrated: true });
      },
    }
  )
);

export function getCurrentUserIdSync(): AccountId | null {
  return useAccountStore.getState().currentUserId;
}
