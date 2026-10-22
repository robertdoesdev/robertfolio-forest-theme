"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useForestTheme } from "@/contexts/forest-theme";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { usePreloader } from "@/components/preloader";
import { useActiveMessage } from "@/lib/creature-messages";
import { CreatureArt, CreatureBush } from "./creature-art";
import { createCreatureEngine, type CreatureEngine } from "./creature-engine";

const subscribeNoop = () => () => {};

/**
 * Bramble, the forest's resident gremlin. Renders a fixed, click-through
 * layer above the page content (below the header). Nothing is rendered on the
 * server, while the preloader runs, or when reduced motion is requested.
 */
export default function ForestCreature() {
  const { isDay } = useForestTheme();
  const { reducedMotion, ready } = usePerfProfile();
  const { isLoading } = usePreloader();
  const message = useActiveMessage();

  const layerRef = useRef<HTMLDivElement>(null);
  const creatureRef = useRef<HTMLDivElement>(null);
  const leftBush = useRef<HTMLDivElement>(null);
  const rightBush = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CreatureEngine | null>(null);
  const isDayRef = useRef(isDay);
  // false on the server and during hydration, true afterwards (no hydration mismatch)
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const enabled = mounted && ready && !reducedMotion && !isLoading;

  useEffect(() => {
    isDayRef.current = isDay;
    engineRef.current?.onDayChange(isDay);
  }, [isDay]);

  useEffect(() => {
    if (!enabled) return;
    const layer = layerRef.current;
    const el = creatureRef.current;
    const left = leftBush.current;
    const right = rightBush.current;
    if (!layer || !el || !left || !right) return;
    const engine = createCreatureEngine({
      layer,
      el,
      bushes: { left, right },
      isDay: () => isDayRef.current,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  const creatureLine = message?.owner === "creature" ? message.text : "";

  return (
    <>
    <div
      ref={layerRef}
      className="forest-creature-layer"
      data-day={isDay ? "true" : "false"}
      aria-hidden="true"
    >
      <div ref={creatureRef} className="creature" data-pose="hidden" data-visible="false" data-facing="r">
        <div className="creature-bubble" data-show={creatureLine ? "true" : "false"}>
          {creatureLine}
        </div>
        <div className="c-flip">
          <CreatureArt />
        </div>
      </div>
      <div ref={leftBush} className="creature-bush" data-side="l" data-active="false">
        <CreatureBush />
      </div>
      <div ref={rightBush} className="creature-bush" data-side="r" data-active="false">
        <CreatureBush />
      </div>
    </div>
    {/* Screen-reader channel for the creature's one-liners (the visual layer is aria-hidden). */}
    <span className="sr-only" role="status" aria-live="polite">
      {creatureLine}
    </span>
    </>
  );
}
