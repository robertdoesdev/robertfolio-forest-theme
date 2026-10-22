"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ForestThemeValue = {
  isDay: boolean;
  toggleDaylight: () => void;
};

const ForestThemeContext = createContext<ForestThemeValue | null>(null);

export function ForestThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false);
  const value = useMemo(
    () => ({ isDay, toggleDaylight: () => setIsDay((current) => !current) }),
    [isDay],
  );

  return (
    <ForestThemeContext.Provider value={value}>
      <div className={isDay ? "forest-world forest-world--day" : "forest-world forest-world--night"}>
        {children}
      </div>
    </ForestThemeContext.Provider>
  );
}

export function useForestTheme() {
  const context = useContext(ForestThemeContext);
  if (!context) throw new Error("useForestTheme must be used inside ForestThemeProvider");
  return context;
}
