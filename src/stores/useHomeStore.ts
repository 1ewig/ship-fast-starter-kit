import { create } from "zustand";
import { listAccounts } from "@/lib/auth-client";

export interface Account {
  id: string;
  providerId: string;
  accountId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  scopes: string[];
}

interface HomeState {
  accounts: Account[];
  isLoadingAccounts: boolean;
  setAccounts: (accounts: Account[]) => void;
  setLoadingAccounts: (loading: boolean) => void;
  fetchAccounts: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  accounts: [],
  isLoadingAccounts: true,
  setAccounts: (accounts) => set({ accounts }),
  setLoadingAccounts: (loading) => set({ isLoadingAccounts: loading }),
  fetchAccounts: async () => {
    set({ isLoadingAccounts: true });
    try {
      const { data } = await listAccounts();
      if (data) {
        set({ accounts: data as Account[] });
      }
    } catch (error) {
      console.error("[HomeStore] fetchAccounts failed:", error);
    } finally {
      set({ isLoadingAccounts: false });
    }
  },
}));
