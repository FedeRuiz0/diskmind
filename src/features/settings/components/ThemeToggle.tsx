import { MonitorCog, Moon, Sun } from "lucide-react";

import { useAppPreferencesStore } from "@shared/store/appPreferences";
import { Button } from "@shared/ui/button";

const labels = {
  dark: "Tema oscuro",
  light: "Tema claro",
  system: "Tema del sistema",
} as const;

export function ThemeToggle() {
  const theme = useAppPreferencesStore((state) => state.theme);
  const cycleTheme = useAppPreferencesStore((state) => state.cycleTheme);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : MonitorCog;

  return (
    <Button aria-label={labels[theme]} size="icon" variant="outline" onClick={cycleTheme}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}
