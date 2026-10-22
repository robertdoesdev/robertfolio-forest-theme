"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import SectionWrapper from "../ui/section-wrapper";
import { SKILLS, SkillNames } from "@/data/constants";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * Tech stack: a text column beside a tilted "wall" of icon tiles whose
 * columns glide in opposite directions (layout adapted from the supplied
 * reference). The wall is decorative and aria-hidden; the same technologies
 * are listed as real text in the left column for keyboard / screen-reader users.
 *
 * Data comes from SKILLS. Reduced motion: the wall stops and shows each tile once.
 */

const GROUPS: { label: string; items: SkillNames[] }[] = [
  { label: "Languages", items: [SkillNames.JS, SkillNames.TS, SkillNames.HTML, SkillNames.CSS] },
  { label: "Interface", items: [SkillNames.REACT, SkillNames.NEXTJS, SkillNames.TAILWIND] },
  { label: "Server & data", items: [SkillNames.NODEJS, SkillNames.POSTGRES, SkillNames.MONGODB] },
  { label: "Workflow", items: [SkillNames.GIT, SkillNames.GITHUB, SkillNames.NPM] },
];

const ALL = GROUPS.flatMap((g) => g.items.map((name) => SKILLS[name]));
type Skill = (typeof ALL)[number];

const COLUMNS = 4;
/** Round-robin so neighbouring columns never start with the same icon. */
const COLUMN_SETS: Skill[][] = Array.from({ length: COLUMNS }, (_, c) => ALL.filter((_, i) => i % COLUMNS === c));
/** A set must be taller than the viewport for a seamless loop: repeat to at least 6 tiles. */
const fill = (items: Skill[]) => {
  const out: Skill[] = [];
  while (out.length < 6) out.push(...items);
  return out;
};

const css = `
.stk-wall {
  position: relative;
  height: 320px;
  overflow: hidden;
  perspective: 1100px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
}
.stk-plane {
  display: flex;
  justify-content: center;
  gap: 12px;
  height: 100%;
  transform: rotateX(10deg) rotateY(-18deg) rotateZ(3deg);
  transform-style: preserve-3d;
}
.stk-col { width: 64px; flex: none; }
.stk-col:nth-child(even) { margin-top: 36px; }
.stk-track { display: flex; flex-direction: column; will-change: transform; animation: stk-up var(--dur) linear infinite; animation-play-state: paused; }
.stk-col[data-dir="down"] .stk-track { animation-name: stk-down; }
.stk-wall[data-active="true"] .stk-track { animation-play-state: running; }
.stk-wall:hover .stk-track { animation-play-state: paused; }
.stk-wall[data-still="true"] .stk-track { animation: none; }
@keyframes stk-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes stk-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }

.stk-tile {
  position: relative;
  display: grid;
  flex: none;
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(145deg, #f7f4ea, #e8e4d6);
  box-shadow: 0 14px 26px -14px rgba(0,0,0,.45), 0 2px 5px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95), inset 0 -3px 8px rgba(60,50,20,.07);
  transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease;
}
.stk-tile img { width: 60%; height: 60%; object-fit: contain; pointer-events: none; }
.stk-tile:hover { transform: translateZ(26px) scale(1.1); box-shadow: 0 22px 34px -14px var(--skill), 0 2px 6px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.95); z-index: 3; }
.stk-label {
  position: absolute;
  left: 50%;
  top: calc(100% + 6px);
  padding: 3px 9px;
  border-radius: 999px;
  background: #1c2a22;
  color: #f1efe4;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, -3px);
  transition: opacity .15s ease, transform .15s ease;
  pointer-events: none;
}
.stk-tile:hover .stk-label { opacity: 1; transform: translate(-50%, 0); }

.stk-card { transition: opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1); }
.stk-card[data-hidden="true"] { opacity: 0; transform: translateY(18px); }

@media (min-width: 640px) {
  .stk-wall { height: 420px; }
  .stk-plane { gap: 16px; transform: rotateX(12deg) rotateY(-22deg) rotateZ(4deg); }
  .stk-col { width: 84px; }
  .stk-col:nth-child(even) { margin-top: 48px; }
  .stk-tile { width: 84px; height: 84px; margin-bottom: 16px; border-radius: 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .stk-track { animation: none !important; }
  .stk-card { transition: none; }
}
`;

const SkillsSection = () => {
  const { reducedMotion, ready } = usePerfProfile();
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const animate = ready && !reducedMotion;

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => {
        setInView(true);
        setRevealed(true);
      });
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <SectionWrapper id="skills" className="flex w-full min-h-screen flex-col justify-center px-4 py-24">
      <style>{css}</style>
      <div
        ref={cardRef}
        data-hidden={animate && !revealed}
        className="stk-card pointer-events-auto mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden rounded-3xl border border-border/70 bg-background/60 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,.6)] backdrop-blur-xl md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:p-14"
      >
        {/* Text */}
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.7)]" />
            Tech stack
          </p>
          <h2 id="skills-heading" className="mt-5 font-display text-4xl font-bold leading-[1.05] text-foreground md:text-5xl">
            Technologies I build with
          </h2>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            The languages, frameworks and tools behind my interfaces and products, from first sketch to shipped code.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {GROUPS.map((group) => (
              <div key={group.label} className="border-t border-border/70 pt-3">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{group.label}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {group.items.map((name) => SKILLS[name].label).join(" · ")}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="#projects"
            className="mt-9 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            See what I&rsquo;ve built
          </Link>
        </div>

        {/* Decorative wall (aria-hidden: the list at left carries the same information as text) */}
        <div
          aria-hidden="true"
          className="stk-wall pointer-events-auto"
          data-active={animate && inView}
          data-still={!animate}
        >
          <div className="stk-plane">
            {COLUMN_SETS.map((items, c) => {
              const set = fill(items);
              // reduced motion: show each technology once instead of a looping track
              const tiles = animate ? [...set, ...set] : items;
              const style = { "--dur": `${set.length * 6}s` } as CSSProperties;
              return (
                <div key={c} className="stk-col" data-dir={c % 2 === 0 ? "up" : "down"} style={style}>
                  <div className="stk-track">
                    {tiles.map((skill, i) => (
                      <div key={`${skill.name}-${i}`} className="stk-tile" style={{ "--skill": skill.color } as CSSProperties}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={skill.icon} alt="" width={48} height={48} loading="lazy" draggable={false} />
                        <span className="stk-label">{skill.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default SkillsSection;
