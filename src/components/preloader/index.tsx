"use client";
import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

import Loader from "./loader";

type PreloaderContextType = {
  isLoading: boolean;
  loadingPercent: number;
  bypassLoading: () => void;
};
const INITIAL: PreloaderContextType = {
  isLoading: true,
  loadingPercent: 0,
  bypassLoading: () => {},
};
export const preloaderContext = createContext<PreloaderContextType>(INITIAL);

type PreloaderProps = {
  children: ReactNode;
  disabled?: boolean;
};

export const usePreloader = () => {
  const context = useContext(preloaderContext);
  if (!context) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
};

/** Absolute upper bound: whatever happens, the intro never holds the site longer than this. */
const MAX_INTRO_MS = 9000;

function Preloader({ children, disabled = false }: PreloaderProps) {
  const pathname = usePathname();
  // Skip the intro for the résumé route (and anywhere it's disabled).
  const skip = disabled || pathname?.startsWith("/resume");

  // Preloader lives in the root layout, so this state survives client-side
  // navigation: the intro plays once per page load and never replays on re-render.
  const [isLoading, setIsLoading] = useState(!skip);
  const [loadingPercent, setLoadingPercent] = useState(skip ? 100 : 0);

  const bypassLoading = useCallback(() => {
    setLoadingPercent(100);
    setIsLoading(false);
  }, []);

  // Failsafe: never trap a visitor on the intro.
  useEffect(() => {
    if (skip) return;
    const id = window.setTimeout(bypassLoading, MAX_INTRO_MS);
    return () => window.clearTimeout(id);
  }, [skip, bypassLoading]);

  return (
    <preloaderContext.Provider
      value={{ isLoading, bypassLoading, loadingPercent }}
    >
      <AnimatePresence mode="wait">{isLoading && <Loader />}</AnimatePresence>
      {children}
    </preloaderContext.Provider>
  );
}

export default Preloader;