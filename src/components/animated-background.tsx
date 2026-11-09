"use client";

import dynamic from "next/dynamic";
import { usePerfProfile } from "@/hooks/use-perf-profile";

const ForestScene = dynamic(() => import("./forest-scene"), { ssr: false });

/** Decorative forest environment. Content remains usable if WebGL is unavailable. */
export default function AnimatedBackground() {
  const { disable3D, ready } = usePerfProfile();
  if (!ready || disable3D) return null;
  return <ForestScene />;
}
