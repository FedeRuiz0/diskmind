import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "dark" | "light" | "system";

interface AppPreferencesState {
  readonly theme: ThemePreference;
  readonly setTheme: (theme: ThemePreference) => void;
  readonly cycleTheme: () => void;
}

const themeCycle: readonly ThemePreference[] = ["dark", "light", "system"];

function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);

  root.classList.toggle("dark", shouldUseDark);
}

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      cycleTheme: () => {
        const currentTheme = get().theme;
        const currentIndex = themeCycle.indexOf(currentTheme);
        const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length] ?? "dark";

        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
    }),
    {
      name: "diskmind:preferences",
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? "dark");
      },
    },
  ),
);
