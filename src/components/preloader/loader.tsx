"use client";
import styles from "./style.module.scss";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { slideUp } from "./anim";
import { usePreloader } from ".";
import { CreatureArt } from "@/components/creature/creature-art";
import { useForestTheme } from "@/contexts/forest-theme";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * ROBERT intro. The site's own forest creature runs along the word, crouches,
 * and jumps onto the "O", which squashes under its weight. The creature then
 * settles and the curtain lifts into the portfolio.
 *
 * The creature reuses the `.creature` / `.forest-creature-layer` pose styles
 * from globals.css, so it is the same character as on the main page.
 */

const WORD = ["R", "O", "B", "E", "R", "T"];
const TARGET = 1; // the "O"

class Cancelled extends Error {}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const at = (x: number, y: number) => `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;

function wait(sig: AbortSignal, ms: number) {
  return new Promise<void>((res, rej) => {
    if (sig.aborted) return rej(new Cancelled());
    const onAbort = () => {
      window.clearTimeout(t);
      rej(new Cancelled());
    };
    const t = window.setTimeout(() => {
      sig.removeEventListener("abort", onAbort);
      res();
    }, ms);
    sig.addEventListener("abort", onAbort, { once: true });
  });
}

/** Run a Web Animation to completion (cancel-safe) and commit its final transform. */
async function play(
  sig: AbortSignal,
  el: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  if (sig.aborted) throw new Cancelled();
  const anim = el.animate(keyframes, { fill: "forwards", ...options });
  const onAbort = () => anim.cancel();
  sig.addEventListener("abort", onAbort, { once: true });
  try {
    await anim.finished;
  } catch {
    throw new Cancelled();
  } finally {
    sig.removeEventListener("abort", onAbort);
  }
  const last = keyframes[keyframes.length - 1].transform;
  if (typeof last === "string" && el.dataset.creature === "true") el.style.transform = last;
  anim.cancel();
}

type Geometry = {
  fontPx: number;
  cx: number; // centre of the O
  inkTop: number;
  inkBottom: number;
  ground: number;
  originY: number; // baseline as a % of the O's box (squash pivot)
};

function measure(o: HTMLElement, wrap: HTMLElement): Geometry {
  const r = o.getBoundingClientRect();
  const cs = getComputedStyle(o);
  const fontPx = parseFloat(cs.fontSize) || 100;
  let baseline = r.top + r.height * 0.8;
  let inkTop = r.top + r.height * 0.18;
  let inkBottom = baseline;
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText("O");
      const fa = m.fontBoundingBoxAscent ?? fontPx * 0.95;
      const fd = m.fontBoundingBoxDescent ?? fontPx * 0.25;
      const lhRaw = parseFloat(cs.lineHeight);
      const lh = Number.isNaN(lhRaw) ? fa + fd : lhRaw;
      baseline = r.top + (lh - (fa + fd)) / 2 + fa;
      inkTop = baseline - m.actualBoundingBoxAscent;
      inkBottom = baseline + m.actualBoundingBoxDescent;
    }
  } catch {
    /* keep the proportional estimate */
  }
  return {
    fontPx,
    cx: r.left + r.width / 2,
    inkTop,
    inkBottom,
    ground: wrap.getBoundingClientRect().bottom - 3,
    originY: ((baseline - r.top) / r.height) * 100,
  };
}

export default function Index() {
  const { bypassLoading } = usePreloader();
  const { isDay } = useForestTheme();
  const { reducedMotion, ready } = usePerfProfile();
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const layerRef = useRef<HTMLDivElement>(null);
  const creatureRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Choreography. Cancel-safe: leaving the screen aborts everything.
  useEffect(() => {
    if (!ready || dimension.width === 0) return;
    const layer = layerRef.current;
    const el = creatureRef.current;
    const wrap = wrapRef.current;
    const o = letterRefs.current[TARGET];
    if (!layer || !el || !wrap || !o) {
      const id = window.setTimeout(bypassLoading, 1500);
      return () => window.clearTimeout(id);
    }
    const ac = new AbortController();
    const sig = ac.signal;
    el.dataset.creature = "true";

    const pose = (p: string) => {
      el.dataset.pose = p;
    };
    const look = (x: number, y = 0) => {
      el.style.setProperty("--look-x", String(x));
      el.style.setProperty("--look-y", String(y));
    };

    (async () => {
      try {
        // Make sure the display font is in before measuring the O.
        await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(sig, 1200)]);
        const g = measure(o, wrap);
        const size = clamp(g.fontPx * 0.5, 52, 92);
        layer.style.setProperty("--c-size", `${size}px`);
        const S = el.offsetWidth || size;
        const vw = window.innerWidth;
        const landY = g.inkTop + 3;
        const capH = g.inkBottom - g.inkTop;

        el.dataset.facing = "r";
        el.dataset.visible = "true";

        if (reducedMotion) {
          // Simplified intro: the creature is simply sitting on the O.
          el.style.transform = at(g.cx, landY);
          pose("idle");
          await wait(sig, 1500);
          bypassLoading();
          return;
        }

        const stopX = clamp(g.cx - g.fontPx * 0.62, S * 0.6, vw - S);
        el.style.transform = at(-S, g.ground);
        pose("run");
        await wait(sig, 350);

        // 1. quick, bouncy run in along the ground line
        const dist = stopX + S;
        await play(sig, el, [{ transform: at(-S, g.ground) }, { transform: at(stopX, g.ground) }], {
          duration: clamp(dist / 0.62, 700, 1800),
          easing: "linear",
        });

        // 2. notices the O
        pose("look");
        look(1, -1);
        await wait(sig, 320);
        look(0, 0);

        // 3. anticipation
        pose("crouch");
        await wait(sig, 340);

        // 4. jump: up and over onto the O
        pose("jump");
        const apexY = landY - S * 0.75;
        const apexX = (stopX + g.cx) / 2;
        await play(
          sig,
          el,
          [
            { transform: at(stopX, g.ground), easing: "cubic-bezier(.2,.7,.4,1)" },
            { transform: at(apexX, apexY), offset: 0.5, easing: "cubic-bezier(.6,0,.8,.4)" },
            { transform: at(g.cx, landY) },
          ],
          { duration: 620 },
        );

        // 5. landing: the O takes the weight (squash & stretch), the creature rides it
        pose("land");
        o.style.transformOrigin = `50% ${g.originY}%`;
        const dip = capH * 0.2;
        const squash = [
          { transform: "scale(1,1)" },
          { transform: "scale(1.16,0.8)", offset: 0.22 },
          { transform: "scale(0.95,1.08)", offset: 0.5 },
          { transform: "scale(1.02,0.98)", offset: 0.78 },
          { transform: "scale(1,1)" },
        ];
        const ride = [
          { transform: at(g.cx, landY) },
          { transform: at(g.cx, landY + dip), offset: 0.22 },
          { transform: at(g.cx, landY - dip * 0.4), offset: 0.5 },
          { transform: at(g.cx, landY + dip * 0.1), offset: 0.78 },
          { transform: at(g.cx, landY) },
        ];
        const neighbours = [TARGET - 1, TARGET + 1]
          .map((i) => letterRefs.current[i])
          .filter((n): n is HTMLSpanElement => !!n);
        neighbours.forEach((n) => {
          n.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(0.02em)", offset: 0.25 },
              { transform: "translateY(0)" },
            ],
            { duration: 560, delay: 40, easing: "ease-out" },
          );
        });
        const squashDone = o.animate(squash, { duration: 700, easing: "ease-out" }).finished.catch(() => undefined);
        window.setTimeout(() => pose("idle"), 360);
        await Promise.all([play(sig, el, ride, { duration: 700, easing: "ease-out" }), squashDone]);

        // 6. settle: a quick look around from its perch
        pose("idle");
        look(0.9, 0);
        await wait(sig, 420);
        look(-0.7, 0);
        await wait(sig, 420);
        look(0, 0);
        await wait(sig, 420);
        bypassLoading();
      } catch (e) {
        if (!(e instanceof Cancelled)) {
          console.error(e);
          bypassLoading();
        }
      }
    })();

    return () => ac.abort();
  }, [ready, reducedMotion, dimension.width, bypassLoading]);

  // Skip with Enter / Escape / Space (the Skip button and a tap also work).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") bypassLoading();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bypassLoading]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height
    }  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className={styles.introduction}
      role="status"
      aria-label="Loading Robert's portfolio"
      onClick={bypassLoading}
    >
      {dimension.width > 0 && (
        <>
          <div className={`${styles.scene} ${reducedMotion ? styles.reduced : ""}`}>
            <div ref={wrapRef} className={styles.wordWrap}>
              <div className={styles.word} aria-hidden="true">
                {WORD.map((letter, i) => (
                  <span
                    key={i}
                    ref={(n) => {
                      letterRefs.current[i] = n;
                    }}
                    className={styles.letter}
                    style={{ "--i": i } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Same creature as the main page: pose styles come from globals.css */}
          <div ref={layerRef} className="forest-creature-layer" data-day={isDay ? "true" : "false"} style={{ zIndex: 5 }} aria-hidden="true">
            <div ref={creatureRef} className="creature" data-pose="hidden" data-visible="false" data-facing="r">
              <div className="c-flip">
                <CreatureArt />
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.skip}
            onClick={(e) => {
              e.stopPropagation();
              bypassLoading();
            }}
          >
            Skip
          </button>

          <svg className={styles.curve} aria-hidden="true">
            <motion.path variants={curve} initial="initial" exit="exit"></motion.path>
          </svg>
        </>
      )}
    </motion.div>
  );
}