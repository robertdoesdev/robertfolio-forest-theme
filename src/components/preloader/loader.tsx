"use client";
import styles from "./style.module.scss";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { slideUp } from "./anim";
import { usePreloader } from ".";
import { IntroCreature } from "./intro-creature";
import { IntroForest } from "./intro-forest";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * ROBERT intro, after the famous lamp ident: on a night forest floor the
 * (big) forest creature hops in from the left, jumps onto the "O" and stomps
 * it flat, wobbles on the wreckage, then hops away. The curtain then lifts.
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

/** Play a Web Animation to the end (cancel-safe), then pin the final transform. */
async function play(sig: AbortSignal, el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
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
  if (typeof last === "string") el.style.transform = last;
  anim.cancel();
}

type Geometry = { fontPx: number; cx: number; inkTop: number; baseline: number; originY: number };

function measure(o: HTMLElement): Geometry {
  const r = o.getBoundingClientRect();
  const cs = getComputedStyle(o);
  const fontPx = parseFloat(cs.fontSize) || 100;
  let baseline = r.top + r.height * 0.8;
  let inkTop = r.top + r.height * 0.18;
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
    }
  } catch {
    /* keep the proportional estimate */
  }
  return { fontPx, cx: r.left + r.width / 2, inkTop, baseline, originY: ((baseline - r.top) / r.height) * 100 };
}

export default function Index() {
  const { bypassLoading } = usePreloader();
  const { reducedMotion, ready } = usePerfProfile();
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const petLayerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (!ready || dimension.width === 0) return;
    const el = petRef.current;
    const layer = petLayerRef.current;
    const root = rootRef.current;
    const scene = sceneRef.current;
    const groundLine = groundRef.current;
    const o = letterRefs.current[TARGET];
    if (!el || !layer || !root || !scene || !groundLine || !o) {
      const id = window.setTimeout(bypassLoading, 1500);
      return () => window.clearTimeout(id);
    }
    const ac = new AbortController();
    const sig = ac.signal;
    const debris: HTMLElement[] = [];
    const pose = (p: string) => {
      el.dataset.pose = p;
    };
    const look = (x: number, y = 0) => {
      el.style.setProperty("--look-x", String(x));
      el.style.setProperty("--look-y", String(y));
    };

    (async () => {
      try {
        // Measure only once the display font is in, otherwise the O moves afterwards.
        await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(sig, 1200)]);
        const g = measure(o);
        const S = clamp(g.fontPx * 0.95, 48, 200); // big: roughly as tall as the letters
        el.style.setProperty("--c-size", `${S}px`);
        const vw = window.innerWidth;
        const ground = g.baseline + 2; // creature stands on the letters' baseline
        const capH = g.baseline - g.inkTop;
        const landY = g.inkTop + 3;

        // the forest floor / ground line follow the word's baseline
        root.style.setProperty("--ground", `${g.baseline}px`);
        groundLine.style.top = `${g.baseline}px`;

        el.dataset.visible = "true";

        if (reducedMotion) {
          // Simplified intro: the creature just sits on the O, nothing travels.
          el.style.transform = at(g.cx, landY);
          pose("idle");
          await wait(sig, 1500);
          bypassLoading();
          return;
        }

        /** One bouncy hop: crouch, spring, arc, land. */
        const hop = async (fromX: number, fromY: number, toX: number, toY: number, apex: number, ms: number) => {
          pose("crouch");
          await wait(sig, 70);
          pose("jump");
          await play(
            sig,
            el,
            [
              { transform: at(fromX, fromY), easing: "cubic-bezier(.2,.7,.4,1)" },
              { transform: at((fromX + toX) / 2, Math.min(fromY, toY) - apex), offset: 0.5, easing: "cubic-bezier(.6,0,.8,.4)" },
              { transform: at(toX, toY) },
            ],
            { duration: ms },
          );
          pose("land");
          await wait(sig, 80);
        };

        const stopX = clamp(g.cx - g.fontPx * 0.78, S * 0.4, vw - S);
        const startX = -S * 0.7;
        el.style.transform = at(startX, ground);
        pose("idle");
        await wait(sig, 350);

        // 1. hops in from the left
        const hops = Math.max(2, Math.round((stopX - startX) / (g.fontPx * 1.1)));
        let x = startX;
        for (let i = 1; i <= hops; i++) {
          const nx = startX + ((stopX - startX) * i) / hops;
          await hop(x, ground, nx, ground, S * 0.45, 420);
          x = nx;
        }

        // 2. spots the O
        pose("look");
        look(1, -1);
        await wait(sig, 260);
        look(0, 0);

        // 3. the big jump onto the O
        pose("crouch");
        await wait(sig, 240);
        pose("jump");
        await play(
          sig,
          el,
          [
            { transform: at(stopX, ground), easing: "cubic-bezier(.2,.7,.4,1)" },
            { transform: at((stopX + g.cx) / 2, landY - S * 0.7), offset: 0.5, easing: "cubic-bezier(.6,0,.8,.4)" },
            { transform: at(g.cx, landY) },
          ],
          { duration: 560 },
        );

        // 4. STOMP: the O is flattened, the creature rides it down
        o.style.transformOrigin = `50% ${g.originY}%`;
        const flatTop = g.baseline - capH * 0.15;
        pose("land");
        burst(layer, g.cx, g.baseline, g.fontPx, debris);
        scene.animate(
          [
            { transform: "translate(0,0)" },
            { transform: "translate(-5px,4px)", offset: 0.15 },
            { transform: "translate(5px,-3px)", offset: 0.35 },
            { transform: "translate(-3px,2px)", offset: 0.6 },
            { transform: "translate(0,0)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
        const crush = o
          .animate(
            [
              { transform: "scale(1,1)" },
              { transform: "scale(1.55,0.11)", offset: 0.5 },
              { transform: "scale(1.42,0.2)", offset: 0.75 },
              { transform: "scale(1.48,0.15)" },
            ],
            { duration: 300, easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" },
          )
          .finished.then(() => {
            o.style.transform = "scale(1.48,0.15)";
          })
          .catch(() => undefined);
        await Promise.all([
          play(
            sig,
            el,
            [
              { transform: at(g.cx, landY), easing: "cubic-bezier(.5,0,.9,.6)" },
              { transform: at(g.cx, flatTop + 6), offset: 0.55, easing: "ease-out" },
              { transform: at(g.cx, flatTop - 10), offset: 0.8, easing: "ease-in" },
              { transform: at(g.cx, flatTop) },
            ],
            { duration: 380 },
          ),
          crush,
        ]);

        // 5. wobbles on the wreckage
        pose("idle");
        look(0.8, 0);
        await wait(sig, 320);
        pose("crouch");
        await wait(sig, 120);
        pose("jump");
        await play(
          sig,
          el,
          [
            { transform: at(g.cx, flatTop), easing: "cubic-bezier(.2,.7,.4,1)" },
            { transform: at(g.cx, flatTop - S * 0.4), offset: 0.5, easing: "cubic-bezier(.6,0,.8,.4)" },
            { transform: at(g.cx, flatTop) },
          ],
          { duration: 400 },
        );
        pose("land");
        await wait(sig, 140);
        look(0, 0);
        pose("idle");
        await wait(sig, 220);

        // 6. hops away to the right, leaving the O flattened
        const awayX = Math.min(g.cx + g.fontPx * 1.4, vw - S * 0.5);
        pose("crouch");
        await wait(sig, 180);
        pose("jump");
        await play(
          sig,
          el,
          [
            { transform: at(g.cx, flatTop), easing: "cubic-bezier(.2,.7,.4,1)" },
            { transform: at((g.cx + awayX) / 2, flatTop - S * 0.8), offset: 0.45, easing: "cubic-bezier(.6,0,.8,.4)" },
            { transform: at(awayX, ground) },
          ],
          { duration: 560 },
        );
        pose("land");
        await wait(sig, 80);
        const exitX = vw + S;
        const outHops = Math.max(2, Math.round((exitX - awayX) / (g.fontPx * 1.1)));
        x = awayX;
        for (let i = 1; i <= outHops; i++) {
          const nx = awayX + ((exitX - awayX) * i) / outHops;
          await hop(x, ground, nx, ground, S * 0.45, 380);
          x = nx;
        }
        await wait(sig, 350);
        bypassLoading();
      } catch (e) {
        if (!(e instanceof Cancelled)) {
          console.error(e);
          bypassLoading();
        }
      }
    })();

    return () => {
      ac.abort();
      debris.forEach((d) => d.remove());
    };
  }, [ready, reducedMotion, dimension.width, bypassLoading]);

  // Skip with Enter / Escape / Space (the Skip button and a tap/click also work).
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
      ref={rootRef}
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
          {/* curtain shape first, so it stays behind everything else */}
          <svg className={styles.curve} aria-hidden="true">
            <motion.path variants={curve} initial="initial" exit="exit"></motion.path>
          </svg>

          <IntroForest />
          <div ref={groundRef} className={styles.groundLine} aria-hidden="true" />

          <div ref={sceneRef} className={styles.scene}>
            <div className={styles.wordWrap}>
              <div className={styles.word} aria-hidden="true">
                {WORD.map((letter, i) => (
                  <span
                    key={i}
                    ref={(n) => {
                      letterRefs.current[i] = n;
                    }}
                    className={`${styles.letter} ${i === TARGET ? styles.target : ""}`}
                    style={{ "--i": i } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div ref={petLayerRef} className={styles.petLayer} aria-hidden="true">
            {/* always the night-time fur: this intro is set at night */}
            <div ref={petRef} className={styles.pet} data-pose="hidden" data-visible="false" data-day="false">
              <IntroCreature />
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
        </>
      )}
    </motion.div>
  );
}

/** Impact: shards of the O and a puff of dust, thrown out of the crater. */
function burst(layer: HTMLElement, x: number, y: number, fontPx: number, bag: HTMLElement[]) {
  const make = (cls: string, w: number, h: number, left: number, top: number) => {
    const d = document.createElement("span");
    d.className = cls;
    d.style.width = `${w}px`;
    d.style.height = `${h}px`;
    d.style.left = `${left}px`;
    d.style.top = `${top}px`;
    layer.appendChild(d);
    bag.push(d);
    return d;
  };
  const done = (d: HTMLElement) => {
    d.remove();
    const i = bag.indexOf(d);
    if (i >= 0) bag.splice(i, 1);
  };
  const sizes = [0.07, 0.05, 0.09, 0.04, 0.06, 0.08, 0.05, 0.07, 0.04, 0.06];
  sizes.forEach((k, i) => {
    const s = k * fontPx;
    const d = make(styles.shard, s, s * 0.55, x - s / 2 + (i - 5) * fontPx * 0.05, y - s);
    const dir = i % 2 === 0 ? -1 : 1;
    const dx = dir * fontPx * (0.25 + (i % 5) * 0.12);
    const up = fontPx * (0.35 + (i % 4) * 0.18);
    d.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.55}px,${-up}px) rotate(${dir * 160}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px,${fontPx * 0.08}px) rotate(${dir * 340}deg)`, opacity: 0 },
      ],
      { duration: 800 + (i % 4) * 90, easing: "cubic-bezier(.3,.1,.5,1)", fill: "forwards" },
    ).onfinish = () => done(d);
  });
  [-1, 1].forEach((dir) => {
    const s = fontPx * 0.32;
    const d = make(styles.dust, s, s * 0.6, x - s / 2, y - s * 0.6);
    d.animate(
      [
        { transform: "translate(0,0) scale(0.3)", opacity: 0.7 },
        { transform: `translate(${dir * fontPx * 0.8}px,-6px) scale(1.7)`, opacity: 0 },
      ],
      { duration: 700, easing: "ease-out", fill: "forwards" },
    ).onfinish = () => done(d);
  });
}