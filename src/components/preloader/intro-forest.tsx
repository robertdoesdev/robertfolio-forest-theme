import styles from "./style.module.scss";

/**
 * Night-forest backdrop for the intro: moon, stars, three layers of pines and
 * drifting fireflies. Fully deterministic (no Math.random) and pure SVG/CSS.
 * The treeline sits on the ground line (`--ground`, set by the loader).
 */

let seed = 7;
const next = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

function pine(x: number, y: number, h: number) {
  const w = h * 0.42;
  const p = (dx: number, dy: number) => `${Math.round(x + dx * w)},${Math.round(y - dy * h)}`;
  return [
    `M${p(0, 1)}`, `L${p(0.3, 0.68)}`, `L${p(0.18, 0.68)}`, `L${p(0.42, 0.38)}`, `L${p(0.26, 0.38)}`,
    `L${p(0.5, 0.08)}`, `L${p(-0.5, 0.08)}`, `L${p(-0.26, 0.38)}`, `L${p(-0.42, 0.38)}`, `L${p(-0.18, 0.68)}`,
    `L${p(-0.3, 0.68)}`, "Z",
  ].join(" ");
}

function layer(count: number, minH: number, maxH: number) {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (i + next() * 0.8) * (1700 / count) - 50;
    const h = minH + next() * (maxH - minH);
    out.push(pine(x, 500, h));
  }
  return out.join(" ");
}

const BACK = layer(15, 190, 300);
const MID = layer(11, 240, 380);
const FRONT = layer(6, 330, 470);

const STARS = Array.from({ length: 46 }, () => ({
  x: Math.round(next() * 1600),
  y: Math.round(next() * 420),
  r: Math.round((0.6 + next() * 1.1) * 10) / 10,
  o: Math.round((0.3 + next() * 0.6) * 100) / 100,
}));

const FIREFLIES = Array.from({ length: 16 }, () => ({
  left: Math.round(next() * 96 + 2),
  top: Math.round(next() * 42 + 38),
  size: Math.round((2 + next() * 2.5) * 10) / 10,
  dur: Math.round((5 + next() * 6) * 10) / 10,
  delay: Math.round(next() * 50) / 10,
}));

export function IntroForest() {
  return (
    <div className={styles.forest} aria-hidden="true">
      <div className={styles.sky} />
      <svg className={styles.stars} viewBox="0 0 1600 460" preserveAspectRatio="xMidYMin slice" focusable="false">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f4eed8" opacity={s.o} />
        ))}
      </svg>
      <div className={styles.moon} />
      <svg className={styles.trees} viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice" focusable="false">
        <path d={BACK} fill="#0a1d23" />
        <path d={MID} fill="#07151a" />
        <path d={FRONT} fill="#040c10" />
      </svg>
      <div className={styles.floor} />
      <div className={styles.mist} />
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className={styles.firefly}
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.dur}s, ${f.dur / 2.3}s`,
            animationDelay: `-${f.delay}s, -${f.delay / 2}s`,
          }}
        />
      ))}
    </div>
  );
}