"use client";

import Particles from "@/components/Particles";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/** Lightweight decorative layer only; template-era cursors, Easter eggs, presence and analytics are intentionally disabled. */
export default function AppOverlays() {
  const { particleCount, maxDpr } = usePerfProfile();
  return (
    <>
      {particleCount > 0 && <Particles className="fixed inset-0 -z-10 animate-fade-in" quantity={particleCount} maxDpr={maxDpr} />}
    </>
  );
}
