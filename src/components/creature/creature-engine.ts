/**
 * Imperative animation engine for the forest creature ("Bramble").
 *
 * Design notes
 * - One scene runs at a time. Scenes are async functions that receive an
 *   AbortSignal; every sleep/tween rejects with `Cancelled` when aborted, so
 *   interruptions (mouse startle, day/night change, unmount) are safe at any
 *   moment and never leave timers or rAF callbacks behind.
 * - The creature is moved with transform: translate3d only. Poses (squash,
 *   run cycle, chew...) are CSS, selected through `data-pose`.
 * - The hero name is never edited. Letter effects use the aria-hidden overlay
 *   rendered next to the real <h1> (`[data-name-fx]`), shown only while an
 *   effect runs (`[data-name-stage][data-fx="on"]`).
 * - rAF only runs while the creature is actually moving.
 */
import { hideMessage, pickMessage, say, type MessageCategory } from "@/lib/creature-messages";

type Vec = { x: number; y: number };
type Side = -1 | 1;
type SceneKind = "peek" | "run" | "name" | "cautious" | "startle" | "flee";
type Pose =
  | "hidden" | "peek" | "idle" | "look" | "crouch" | "run" | "jump" | "land"
  | "bounce" | "lean" | "bite" | "chew" | "startled";

export type CreatureEngine = {
  destroy: () => void;
  onDayChange: (isDay: boolean) => void;
};

export type EngineOptions = {
  layer: HTMLElement;
  el: HTMLElement;
  bushes: { left: HTMLElement; right: HTMLElement };
  isDay: () => boolean;
};

class Cancelled extends Error {
  constructor() {
    super("cancelled");
    this.name = "Cancelled";
  }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const linear = (t: number) => t;

const RUN_SPEED = 560; // px / s
const NIBBLE_COOLDOWN = 80_000;

type InkOffsets = { dx0: number; dy0: number; dx1: number; dy1: number };

export function createCreatureEngine(opts: EngineOptions): CreatureEngine {
  const { layer, el, bushes } = opts;

  let disposed = false;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let S = el.offsetWidth || 64;

  let x = -400;
  let y = vh + 80;
  let lift = 0;
  let facing: Side = 1;
  let pose: Pose = "hidden";
  let visible = false;
  let lastShift = 0;
  let lastBubble = "above";

  let scene: { kind: SceneKind; ac: AbortController } | null = null;
  const life = new AbortController();
  let wakeAc = new AbortController();

  let calmUntil = 0; // no startle before this time
  let graceUntil = 0; // visitor gets time to observe a fresh appearance
  let bonusDelay = 0;
  let lastNibble = 0;
  let lastAction = "";
  let onName = false;
  let nibblePhase = false;

  let followFn: (() => Vec) | null = null;
  let followRaf = 0;
  const timers = new Set<number>();
  const crumbs = new Set<HTMLElement>();

  /* ------------------------------------------------------------------ */
  /* geometry                                                            */
  /* ------------------------------------------------------------------ */
  const ground = () => vh - 12;
  const hideX = (side: Side) => (side < 0 ? S * 0.34 : vw - S * 0.34);
  const bushTop = () => vh + 8 - (bushes.left.offsetHeight || 66);
  const peekY = () => bushTop() - 8 + S * 0.594;
  const hiddenY = () => vh + S * 0.6;

  function layout() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    S = el.offsetWidth || 64;
    if (visible && !followFn) {
      x = clamp(x, 0, vw);
    }
    apply();
  }

  function apply() {
    const yy = y + lift;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0)`;
    const half = 96;
    let shift = 0;
    if (x - half < 8) shift = 8 - (x - half);
    else if (x + half > vw - 8) shift = vw - 8 - (x + half);
    if (Math.abs(shift - lastShift) > 0.5) {
      lastShift = shift;
      el.style.setProperty("--bubble-shift", `${shift.toFixed(0)}px`);
    }
    const bubble = yy - S * 0.95 - 70 < 70 ? "below" : "above";
    if (bubble !== lastBubble) {
      lastBubble = bubble;
      el.dataset.bubble = bubble;
    }
  }

  function setPose(p: Pose) {
    if (pose === p) return;
    pose = p;
    el.dataset.pose = p;
  }
  function setFacing(f: Side) {
    if (facing === f) return;
    facing = f;
    el.dataset.facing = f > 0 ? "r" : "l";
  }
  function setVisible(v: boolean) {
    if (visible === v) return;
    visible = v;
    el.dataset.visible = v ? "true" : "false";
  }
  function setLook(lx: number, ly = 0) {
    el.style.setProperty("--look-x", String(lx));
    el.style.setProperty("--look-y", String(ly));
  }
  function setBush(side: Side, active: boolean, rustle = false) {
    const b = side < 0 ? bushes.left : bushes.right;
    b.dataset.active = active ? "true" : "false";
    if (rustle) {
      b.dataset.rustle = "false";
      void b.getBoundingClientRect();
      b.dataset.rustle = "true";
    }
  }
  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  /* ------------------------------------------------------------------ */
  /* async primitives                                                    */
  /* ------------------------------------------------------------------ */
  function sleep(sig: AbortSignal, ms: number) {
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

  /** Scheduler wait: resolves true if woken early (e.g. night fell). */
  function waitFor(ms: number, ignoreWake = false) {
    return new Promise<boolean>((res, rej) => {
      if (life.signal.aborted) return rej(new Cancelled());
      const wake = wakeAc.signal;
      if (wake.aborted && !ignoreWake) return res(true);
      const cleanup = () => {
        window.clearTimeout(t);
        life.signal.removeEventListener("abort", onLife);
        wake.removeEventListener("abort", onWake);
      };
      const onLife = () => {
        cleanup();
        rej(new Cancelled());
      };
      const onWake = () => {
        cleanup();
        res(true);
      };
      const t = window.setTimeout(() => {
        cleanup();
        res(false);
      }, ms);
      life.signal.addEventListener("abort", onLife, { once: true });
      if (!ignoreWake) wake.addEventListener("abort", onWake, { once: true });
    });
  }

  function tween(
    sig: AbortSignal,
    o: { to: Vec | (() => Vec); ms: number; ease?: (t: number) => number; arc?: number },
  ) {
    return new Promise<void>((res, rej) => {
      if (sig.aborted) return rej(new Cancelled());
      const fx = x;
      const fy = y;
      const ease = o.ease ?? linear;
      const start = performance.now();
      let id = 0;
      const target = () => (typeof o.to === "function" ? o.to() : o.to);
      const onAbort = () => {
        cancelAnimationFrame(id);
        y += lift; // keep the current visual position, no snap
        lift = 0;
        apply();
        rej(new Cancelled());
      };
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / Math.max(1, o.ms));
        const e = ease(t);
        const g = target();
        x = fx + (g.x - fx) * e;
        y = fy + (g.y - fy) * e;
        lift = -(o.arc ?? 0) * 4 * t * (1 - t);
        apply();
        if (t >= 1) {
          sig.removeEventListener("abort", onAbort);
          lift = 0;
          apply();
          res();
        } else {
          id = requestAnimationFrame(step);
        }
      };
      sig.addEventListener("abort", onAbort, { once: true });
      id = requestAnimationFrame(step);
    });
  }

  /** Keep the creature glued to a moving anchor (page can scroll under it). */
  function startFollow(sig: AbortSignal, fn: () => Vec) {
    stopFollow();
    followFn = fn;
    const loop = () => {
      if (!followFn) return;
      const g = followFn();
      x = g.x;
      y = g.y;
      apply();
      followRaf = requestAnimationFrame(loop);
    };
    followRaf = requestAnimationFrame(loop);
    sig.addEventListener("abort", stopFollow, { once: true });
  }
  function stopFollow() {
    followFn = null;
    cancelAnimationFrame(followRaf);
  }

  async function runTo(sig: AbortSignal, tx: number, ty = ground()) {
    const dx = tx - x;
    if (Math.abs(dx) > 2) setFacing(dx > 0 ? 1 : -1);
    setPose("run");
    const dist = Math.hypot(dx, ty - y);
    const ms = clamp((dist / RUN_SPEED) * 1000, 260, 3200);
    await tween(sig, { to: { x: tx, y: ty }, ms, ease: linear });
  }

  async function lookAround(sig: AbortSignal, times = 2, up = false) {
    setPose("look");
    for (let i = 0; i < times; i++) {
      setLook(i % 2 === 0 ? -1 : 1, up ? -0.8 : 0);
      await sleep(sig, rand(420, 760));
    }
    setLook(0, 0);
  }

  /* ------------------------------------------------------------------ */
  /* name letters (overlay only — the real <h1> is never modified)       */
  /* ------------------------------------------------------------------ */
  let ctx2d: CanvasRenderingContext2D | null = null;
  let fxOffTimer = 0;
  let biteLetter: HTMLElement | null = null;
  let biteToken = 0;
  let biteGeom: { cx: number; cy: number } | null = null;

  const stageEl = () => document.querySelector<HTMLElement>("[data-name-stage]");
  const lineLetters = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-name-fx] [data-name-letter][data-line="0"]'));

  function nameVisible() {
    const s = stageEl();
    if (!s) return false;
    const r = s.getBoundingClientRect();
    return r.width > 40 && r.top >= 80 && r.bottom <= vh - 50 && r.left >= -2 && r.right <= vw + 4;
  }

  function fxOn() {
    window.clearTimeout(fxOffTimer);
    stageEl()?.setAttribute("data-fx", "on");
  }
  function fxOffSoon(ms: number) {
    window.clearTimeout(fxOffTimer);
    fxOffTimer = window.setTimeout(() => {
      if (!biteLetter) stageEl()?.removeAttribute("data-fx");
    }, ms);
  }

  function inkOffsets(letter: HTMLElement): InkOffsets {
    const r = letter.getBoundingClientRect();
    const cs = getComputedStyle(letter);
    const pt = parseFloat(cs.paddingTop) || 0;
    const pl = parseFloat(cs.paddingLeft) || 0;
    const fs = parseFloat(cs.fontSize) || 64;
    try {
      ctx2d = ctx2d ?? document.createElement("canvas").getContext("2d");
      if (!ctx2d) throw new Error("no 2d context");
      ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      let ch = letter.textContent ?? "";
      if (cs.textTransform === "uppercase") ch = ch.toUpperCase();
      const m = ctx2d.measureText(ch);
      const fa = m.fontBoundingBoxAscent ?? fs * 0.95;
      const fd = m.fontBoundingBoxDescent ?? fs * 0.25;
      const lhRaw = parseFloat(cs.lineHeight);
      const lh = Number.isNaN(lhRaw) ? fa + fd : lhRaw;
      const baseline = pt + (lh - (fa + fd)) / 2 + fa;
      return {
        dx0: pl - m.actualBoundingBoxLeft,
        dx1: pl + m.actualBoundingBoxRight,
        dy0: baseline - m.actualBoundingBoxAscent,
        dy1: baseline + m.actualBoundingBoxDescent,
      };
    } catch {
      return { dx0: pl, dx1: r.width - pl, dy0: pt + fs * 0.12, dy1: pt + fs * 0.85 };
    }
  }

  function squashLetters(idx: number, power = 1) {
    const L = lineLetters();
    L.forEach((letter, i) => {
      const d = Math.abs(i - idx);
      if (d > 2) return;
      const k = power * (1 - d * 0.32);
      letter.animate(
        [
          { transform: "scale(1,1)" },
          { transform: `scale(${1 + 0.14 * k},${1 - 0.22 * k})`, offset: 0.22 },
          { transform: `scale(${1 - 0.07 * k},${1 + 0.12 * k})`, offset: 0.52 },
          { transform: `scale(${1 + 0.03 * k},${1 - 0.04 * k})`, offset: 0.78 },
          { transform: "scale(1,1)" },
        ],
        { duration: 560, delay: d * 55, easing: "cubic-bezier(.3,.7,.4,1)" },
      );
    });
  }

  function setBiteVars(letter: HTMLElement, off: InkOffsets) {
    const w = off.dx1 - off.dx0;
    const h = off.dy1 - off.dy0;
    const r1 = Math.max(9, 0.27 * h);
    const c1 = { x: off.dx1 - 0.2 * w, y: off.dy0 + 0.04 * h };
    const c2 = { x: c1.x - r1 * 0.98, y: c1.y + r1 * 0.55, r: r1 * 0.46 };
    const c3 = { x: c1.x + r1 * 0.1, y: c1.y + r1 * 1.0, r: r1 * 0.4 };
    const set = (k: string, v: number) => letter.style.setProperty(k, `${v.toFixed(1)}px`);
    set("--x1", c1.x); set("--y1", c1.y); set("--r1", r1);
    set("--x2", c2.x); set("--y2", c2.y); set("--r2", c2.r);
    set("--x3", c3.x); set("--y3", c3.y); set("--r3", c3.r);
    biteGeom = { cx: c1.x, cy: c1.y };
  }

  function animateBite(letter: HTMLElement, from: number, to: number, ms: number) {
    const token = ++biteToken;
    return new Promise<void>((res) => {
      const start = performance.now();
      const step = (now: number) => {
        if (token !== biteToken || disposed) return res();
        const t = clamp((now - start) / ms, 0, 1);
        letter.style.setProperty("--p", String(from + (to - from) * easeOut(t)));
        if (t < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  }

  function spawnCrumbs(letter: HTMLElement, off: InkOffsets) {
    if (!biteGeom) return;
    const r = letter.getBoundingClientRect();
    const color = getComputedStyle(letter).color;
    const ox = r.left + biteGeom.cx;
    const oy = r.top + biteGeom.cy;
    for (let i = 0; i < 6; i++) {
      const c = document.createElement("span");
      c.className = "creature-crumb";
      c.style.background = color;
      c.style.left = `${ox}px`;
      c.style.top = `${oy}px`;
      const size = rand(3, 6);
      c.style.width = c.style.height = `${size}px`;
      layer.appendChild(c);
      crumbs.add(c);
      const a = c.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${rand(-26, 26)}px,${rand(34, 70)}px) rotate(${rand(-200, 200)}deg)`, opacity: 0 },
        ],
        { duration: rand(520, 860), easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" },
      );
      a.onfinish = () => {
        c.remove();
        crumbs.delete(c);
      };
    }
    void off;
  }

  async function takeBite(letter: HTMLElement, off: InkOffsets) {
    fxOn();
    setBiteVars(letter, off);
    letter.style.setProperty("--p", "0");
    letter.setAttribute("data-bite", "");
    biteLetter = letter;
    spawnCrumbs(letter, off);
    await animateBite(letter, 0, 1, 240);
  }

  /** Restore the letter. Instant on day/unmount, eased otherwise. */
  function clearBite(animated: boolean) {
    const letter = biteLetter;
    if (!letter) return;
    biteLetter = null;
    biteGeom = null;
    const done = () => {
      letter.removeAttribute("data-bite");
      ["--p", "--x1", "--y1", "--r1", "--x2", "--y2", "--r2", "--x3", "--y3", "--r3"].forEach((k) =>
        letter.style.removeProperty(k),
      );
      fxOffSoon(120);
    };
    if (!animated || disposed) {
      biteToken++;
      done();
      return;
    }
    void animateBite(letter, 1, 0, 650).then(done);
  }

  /* ------------------------------------------------------------------ */
  /* scene runner                                                        */
  /* ------------------------------------------------------------------ */
  function finishVisuals(immediate = false) {
    stopFollow();
    onName = false;
    nibblePhase = false;
    setLook(0, 0);
    setPose("hidden");
    setVisible(false);
    y = vh + 120;
    apply();
    const off = () => {
      bushes.left.dataset.active = "false";
      bushes.right.dataset.active = "false";
    };
    if (immediate) off();
    else later(off, 450);
    if (biteLetter) clearBite(!immediate);
    else fxOffSoon(immediate ? 0 : 500);
  }

  function abortScene() {
    scene?.ac.abort();
    scene = null;
  }

  async function run(kind: SceneKind, fn: (sig: AbortSignal) => Promise<void>) {
    if (disposed) return;
    scene?.ac.abort();
    const ac = new AbortController();
    const me = { kind, ac };
    scene = me;
    try {
      await fn(ac.signal);
    } catch (e) {
      if (!(e instanceof Cancelled)) console.error(e);
    }
    if (scene === me) {
      scene = null;
      finishVisuals();
    }
  }

  function speak(category: MessageCategory, chance = 1, ms = 2600) {
    if (Math.random() > chance) return;
    say("creature", pickMessage(category), ms);
  }

  /* ------------------------------------------------------------------ */
  /* reusable beats                                                      */
  /* ------------------------------------------------------------------ */
  async function popOut(sig: AbortSignal, side: Side) {
    x = hideX(side);
    y = hiddenY();
    lift = 0;
    setFacing(side < 0 ? 1 : -1);
    setLook(0, 0);
    setPose("peek");
    setVisible(true);
    apply();
    setBush(side, true, true);
    graceUntil = performance.now() + 1500;
    await sleep(sig, 260);
    await tween(sig, { to: { x, y: peekY() }, ms: 420, ease: easeOut });
  }

  async function sinkIn(sig: AbortSignal, side: Side) {
    await runTo(sig, hideX(side), ground());
    setBush(side, true, true);
    setPose("peek");
    setLook(0, 0);
    await tween(sig, { to: { x, y: hiddenY() }, ms: 320, ease: easeInOut });
  }

  /** Jump off the name (or any height) and bolt to the nearest/preferred bush. */
  async function leave(sig: AbortSignal, preferSide?: Side) {
    stopFollow();
    const side: Side = preferSide ?? (x < vw / 2 ? -1 : 1);
    if (onName) {
      onName = false;
      setPose("crouch");
      await sleep(sig, 170);
      fxOn();
      squashLetters(Math.round(rand(1, 4)), 0.8);
      setPose("jump");
      const tx = clamp(x + side * rand(120, 200), S * 0.6, vw - S * 0.6);
      const dy = ground() - y;
      await tween(sig, { to: { x: tx, y: ground() }, ms: clamp(420 + dy * 0.45, 520, 900), ease: easeInOut, arc: 40 });
      setPose("land");
      await sleep(sig, 110);
    }
    await sinkIn(sig, side);
  }

  /** Reaction to being spotted: wide eyes, hop away, hide. */
  async function startledEscape(sig: AbortSignal, from: Vec | null, wasOnName: boolean) {
    setPose("startled");
    if (from) {
      setFacing(from.x > x ? 1 : -1);
      setLook(from.x > x ? 1 : -1, 0);
    }
    await sleep(sig, wasOnName ? 230 : 320);
    setLook(0, 0);
    const side: Side = from ? (from.x > x ? -1 : 1) : x < vw / 2 ? -1 : 1;
    setFacing(side);
    if (!wasOnName && y < ground() + 4 && y > peekY() - 4) {
      setPose("crouch");
      await sleep(sig, 120);
      setPose("jump");
      await tween(sig, { to: { x: x + side * 70, y: ground() }, ms: 340, ease: easeOut, arc: 38 });
    }
    await leave(sig, side);
  }

  /* ------------------------------------------------------------------ */
  /* scenes                                                              */
  /* ------------------------------------------------------------------ */
  async function peekScene(sig: AbortSignal) {
    const side: Side = Math.random() < 0.5 ? -1 : 1;
    await popOut(sig, side);
    const looks = randInt(2, 3);
    for (let i = 0; i < looks; i++) {
      setPose("peek");
      setLook(pick([-1, 1, 0.5, -0.5]), pick([0, 0, -0.5]));
      await sleep(sig, rand(550, 1000));
    }
    if (Math.random() < 0.35) {
      // duck, wait, pop again
      await tween(sig, { to: { x, y: hiddenY() }, ms: 240, ease: easeInOut });
      await sleep(sig, rand(600, 1100));
      setLook(side < 0 ? 1 : -1, 0);
      await tween(sig, { to: { x, y: peekY() }, ms: 340, ease: easeOut });
      await sleep(sig, rand(500, 800));
    }
    setLook(0, 0);
    await tween(sig, { to: { x, y: hiddenY() }, ms: 340, ease: easeInOut });
  }

  async function runScene(sig: AbortSignal) {
    const side: Side = Math.random() < 0.5 ? -1 : 1;
    await popOut(sig, side);
    await sleep(sig, rand(250, 600));
    // step out, then look before committing
    await tween(sig, { to: { x: x + side * S * 0.9, y: ground() }, ms: 260, ease: easeOut });
    await lookAround(sig, 2);
    // anticipation
    setPose("crouch");
    await sleep(sig, 380);
    const midX = vw * rand(0.32, 0.68);
    await runTo(sig, midX);
    const r = Math.random();
    if (r < 0.4) {
      setPose("idle");
      await lookAround(sig, 2);
    } else if (r < 0.78) {
      setPose("crouch");
      await sleep(sig, 160);
      setPose("jump");
      await tween(sig, { to: { x, y: ground() }, ms: 520, ease: linear, arc: 64 });
      setPose("land");
      await sleep(sig, 140);
      if (Math.random() < 0.5) {
        setPose("bounce");
        await sleep(sig, 700);
      }
    } else {
      // double-take: dash back a little, spin, dash forward again
      await runTo(sig, midX - side * vw * 0.12);
      setFacing(side);
      setPose("startled");
      await sleep(sig, 280);
    }
    await sinkIn(sig, (side * -1) as Side);
  }

  async function cautiousScene(sig: AbortSignal) {
    // Daytime: it eyes the name from afar but never climbs it.
    const stage = stageEl();
    const side: Side = Math.random() < 0.5 ? -1 : 1;
    await popOut(sig, side);
    await tween(sig, { to: { x, y: ground() }, ms: 240, ease: easeOut });
    await lookAround(sig, 1);
    let tx = vw * 0.4;
    if (stage) {
      const r = stage.getBoundingClientRect();
      tx = clamp(r.left + r.width * 0.5 + side * -r.width * 0.9, S, vw - S);
    }
    tx = side < 0 ? Math.min(tx, vw * 0.45) : Math.max(tx, vw * 0.55);
    await runTo(sig, tx);
    setPose("look");
    setLook(0, -1);
    await sleep(sig, rand(900, 1500));
    setPose("crouch");
    await sleep(sig, 420);
    setFacing((facing * -1) as Side);
    setPose("startled");
    await sleep(sig, 360);
    setFacing(side);
    setLook(0, 0);
    await sinkIn(sig, side);
  }

  async function nameScene(sig: AbortSignal) {
    const L = lineLetters();
    if (L.length < 3 || !nameVisible()) return;
    const wantBite = !biteLetter && performance.now() - lastNibble > NIBBLE_COOLDOWN && Math.random() < 0.4;
    const idx = wantBite ? pick([1, 2, 4].filter((i) => i < L.length)) : randInt(1, Math.max(1, L.length - 2));
    const letter = L[idx];
    const off = inkOffsets(letter);
    const spanW = off.dx1 - off.dx0;
    const rectOf = () => letter.getBoundingClientRect();
    // Landing spot: top edge of the letter; for a nibble, standing so its mouth is over the top-right shoulder.
    const anchor = (): Vec => {
      const r = rectOf();
      const base = r.left + off.dx0 + spanW * (wantBite ? 0.78 : 0.5);
      return { x: wantBite ? base - S * 0.2 : base, y: r.top + off.dy0 + 4 };
    };

    const side: Side = anchor().x < vw / 2 ? -1 : 1;
    await popOut(sig, side);
    await sleep(sig, rand(300, 700));
    await tween(sig, { to: { x: x + side * S * 0.9, y: ground() }, ms: 260, ease: easeOut });

    // run under the name, stopping short of it
    const a0 = anchor();
    const stopX = clamp(a0.x - side * rand(90, 140), S * 0.8, vw - S * 0.8);
    await runTo(sig, stopX);

    // notice the lettering
    setFacing(a0.x > x ? 1 : -1);
    setPose("look");
    setLook(facing, -1);
    await sleep(sig, rand(650, 1000));
    setLook(0, 0);

    // anticipation + jump
    setPose("crouch");
    await sleep(sig, 460);
    fxOn();
    setPose("jump");
    const a1 = anchor();
    const dy = ground() - a1.y;
    await tween(sig, {
      to: anchor,
      ms: clamp(520 + Math.abs(dy) * 0.55, 650, 1050),
      ease: easeInOut,
      arc: clamp(Math.abs(dy) * 0.35 + 50, 70, 190),
    });
    onName = true;
    setFacing(wantBite ? 1 : x > vw / 2 ? -1 : 1);
    setPose("land");
    squashLetters(idx, 1.1);
    startFollow(sig, anchor);
    await sleep(sig, 150);
    setPose("bounce");
    speak("onName", 0.7);

    if (wantBite) {
      await sleep(sig, rand(700, 1000));
      // is anyone watching?
      setPose("look");
      for (const lx of [-1, 1, -0.6]) {
        setLook(lx, 0);
        await sleep(sig, rand(380, 560));
      }
      setLook(0, 0);
      setFacing(1);
      nibblePhase = true;
      setPose("lean");
      await sleep(sig, 480);
      setPose("bite");
      await takeBite(letter, off);
      lastNibble = performance.now();
      speak("nibble", 1, 2400);
      await sleep(sig, 160);
      setPose("chew");
      await sleep(sig, rand(1500, 2100));
      // ...and then it notices it's been noticed
      setPose("startled");
      speak("caught", 0.6, 2200);
      await sleep(sig, 420);
      nibblePhase = false;
      later(() => clearBite(true), 1300);
    } else {
      const bounces = randInt(1, 3);
      for (let i = 0; i < bounces; i++) {
        await sleep(sig, rand(700, 1100));
        squashLetters(idx, 0.6);
      }
      await sleep(sig, rand(500, 1000));
    }
    await leave(sig);
  }

  /* ------------------------------------------------------------------ */
  /* interruptions                                                       */
  /* ------------------------------------------------------------------ */
  let ptr = { x: -999, y: -999 };
  let lastDist = Infinity;
  let dwell = 0;

  const centre = (): Vec => ({ x, y: y + lift - S * 0.4 });

  function startle(from: Vec) {
    if (disposed || !visible || scene?.kind === "startle" || scene?.kind === "flee") return;
    const wasOnName = onName;
    const wasNibbling = nibblePhase;
    calmUntil = performance.now() + 9000;
    bonusDelay = rand(6000, 12000);
    window.clearTimeout(dwell);
    dwell = 0;
    if (biteLetter) later(() => clearBite(true), 1400);
    void run("startle", async (sig) => {
      nibblePhase = false;
      speak("caught", wasOnName || wasNibbling ? 1 : 0.5, 2400);
      await startledEscape(sig, from, wasOnName);
    });
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType === "touch" || disposed) return;
    ptr = { x: e.clientX, y: e.clientY };
    if (!visible) return;
    const c = centre();
    const d = Math.hypot(ptr.x - c.x, ptr.y - c.y);
    const approaching = d < lastDist - 1.5;
    lastDist = d;
    const now = performance.now();

    // caught mid-nibble: stop and escape immediately
    if (nibblePhase) {
      if (d < 210 && approaching) startle(ptr);
      return;
    }
    if (now < calmUntil || now < graceUntil || pose === "hidden") return;
    const R = S * 1.7;
    if (d < R) {
      if (!dwell) {
        // give the visitor a moment: it only reacts if the pointer lingers
        dwell = window.setTimeout(() => {
          dwell = 0;
          const c2 = centre();
          if (Math.hypot(ptr.x - c2.x, ptr.y - c2.y) < R * 1.1) startle(ptr);
        }, 380);
      }
    } else if (dwell) {
      window.clearTimeout(dwell);
      dwell = 0;
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (disposed || !visible) return;
    const c = centre();
    const reach = e.pointerType === "touch" ? S * 1.05 : S * 0.8;
    if (Math.hypot(e.clientX - c.x, e.clientY - c.y) < reach) startle({ x: e.clientX, y: e.clientY });
  }

  function onVisibility() {
    if (document.hidden) {
      abortScene();
      finishVisuals(true);
    }
  }

  let resizeRaf = 0;
  function onResize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layout);
  }

  function onDayChange(day: boolean) {
    if (disposed) return;
    if (day) {
      // Name effects are reserved for night: restore instantly and head for the trees.
      clearBite(false);
      nibblePhase = false;
      if (scene && scene.kind === "name") {
        void run("flee", async (sig) => {
          setPose("startled");
          await sleep(sig, 160);
          await leave(sig);
        });
      }
    } else {
      // Night falls: wake the creature up a bit sooner than usual.
      wakeAc.abort();
    }
  }

  /* ------------------------------------------------------------------ */
  /* scheduler                                                           */
  /* ------------------------------------------------------------------ */
  type Action = "peek" | "run" | "name" | "cautious";

  function choose(): Action {
    const day = opts.isDay();
    const nv = nameVisible();
    const table: [Action, number][] = day
      ? [["peek", 5], ["run", 3], ["cautious", nv ? 2 : 0]]
      : [["peek", 2.5], ["run", 3.5], ["name", nv ? 4.5 : 0]];
    const weighted = table.map(([a, w]) => [a, a === lastAction ? w * 0.3 : w] as [Action, number]);
    const total = weighted.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [a, w] of weighted) {
      r -= w;
      if (r <= 0) return a;
    }
    return "peek";
  }

  const nextDelay = () => (opts.isDay() ? rand(16000, 34000) : rand(10000, 22000)) + bonusDelay;

  async function schedule() {
    try {
      await waitFor(rand(5500, 9000), true);
      while (!disposed) {
        if (!document.hidden && !scene && performance.now() >= calmUntil - 2000) {
          const a = choose();
          lastAction = a;
          bonusDelay = 0;
          const fn =
            a === "peek" ? peekScene : a === "run" ? runScene : a === "name" ? nameScene : cautiousScene;
          await run(a, fn);
          while (scene && !disposed) await waitFor(300, true);
        }
        const woke = await waitFor(nextDelay());
        if (woke) {
          wakeAc = new AbortController();
          await waitFor(rand(2500, 6000), true);
        }
      }
    } catch (e) {
      if (!(e instanceof Cancelled)) console.error(e);
    }
  }

  /* ------------------------------------------------------------------ */
  /* lifecycle                                                           */
  /* ------------------------------------------------------------------ */
  el.dataset.pose = "hidden";
  el.dataset.visible = "false";
  el.dataset.facing = "r";
  apply();

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  void schedule();

  return {
    onDayChange,
    destroy() {
      if (disposed) return;
      disposed = true;
      life.abort();
      wakeAc.abort();
      abortScene();
      stopFollow();
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(dwell);
      window.clearTimeout(fxOffTimer);
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      crumbs.forEach((c) => c.remove());
      crumbs.clear();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      // restore the name instantly and leave nothing behind
      biteToken++;
      if (biteLetter) {
        biteLetter.removeAttribute("data-bite");
        biteLetter.removeAttribute("style");
        biteLetter = null;
      }
      stageEl()?.removeAttribute("data-fx");
      bushes.left.dataset.active = "false";
      bushes.right.dataset.active = "false";
      el.dataset.visible = "false";
      hideMessage(null, "creature");
    },
  };
}
