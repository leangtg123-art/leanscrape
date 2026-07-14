import { create } from "zustand";

interface AppState {
  theme: string;
  showPicker: boolean;
  setTheme: (theme: string) => void;
  setShowPicker: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "crimson-core", // Default
  showPicker: false,
  setTheme: (theme) => set({ theme }),
  setShowPicker: (show) => set({ showPicker: show }),
}));
