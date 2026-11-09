import styles from "./style.module.scss";

/**
 * The forest creature ("Bramble"), same drawing as the one on the main page,
 * copied here with its own class names so the intro is fully self-contained
 * (no dependency on styles living in globals.css). Faces right.
 */
export function IntroCreature() {
  return (
    <svg className={styles.svg} viewBox="0 0 80 80" focusable="false" aria-hidden="true">
      <g className={styles.tail}>
        <path d="M27 58 C6 62 0 38 8 24 C13 14 25 15 23 26 C22 33 15 37 19 46 C21 51 27 50 31 53 Z" fill="var(--c-fur)" />
        <path d="M13 30 C14 24 19 22 21 26 C19 30 15 33 16 38 C13 37 12 34 13 30 Z" fill="var(--c-fur-light)" opacity=".7" />
        <circle cx="11" cy="22" r="5.2" fill="var(--c-cream)" />
        <path d="M6 20 l2 2 M9 16 l1 3 M14 17 l-1 3" stroke="var(--c-fur-dark)" strokeWidth="1" strokeLinecap="round" opacity=".55" />
      </g>
      <g className={styles.body}>
        <ellipse className={`${styles.foot} ${styles.footB}`} cx="47" cy="74" rx="6" ry="3.2" fill="var(--c-fur-dark)" />
        <ellipse cx="38" cy="55" rx="16" ry="15.5" fill="var(--c-fur)" />
        <ellipse cx="43" cy="58" rx="9" ry="10.5" fill="var(--c-cream)" />
        <path d="M24 50 C26 44 30 42 34 43" stroke="var(--c-fur-dark)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".4" />
        <ellipse className={`${styles.foot} ${styles.footA}`} cx="32" cy="74" rx="6.6" ry="3.5" fill="var(--c-fur-dark)" />
        <g stroke="var(--c-cream)" strokeWidth="1" strokeLinecap="round" opacity=".9">
          <path d="M29 75 v1.4 M32 76 v1.4 M35 75 v1.4" />
        </g>
        <g className={styles.arm}>
          <ellipse cx="47" cy="57" rx="3.3" ry="5" fill="var(--c-fur-dark)" transform="rotate(-14 47 57)" />
          <circle cx="48.4" cy="61.4" r="2.5" fill="var(--c-fur-dark)" />
        </g>
        <g className={styles.head}>
          <g className={styles.ear}>
            <path d="M52 18 L61 5 L60 24 Z" fill="var(--c-fur-dark)" />
            <path d="M54 19 L59.5 10 L58.8 21.5 Z" fill="var(--c-ear)" />
            <path d="M61 5 l2.4-3 M61 5 l.2-3.6" stroke="var(--c-fur-dark)" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          <g className={styles.ear}>
            <path d="M30 23 L27 6 L41 16.5 Z" fill="var(--c-fur)" />
            <path d="M31.5 21 L29.4 10.6 L38 17 Z" fill="var(--c-ear)" />
            <path d="M27 6 l-2.6-2.6 M27 6 l.4-3.6" stroke="var(--c-fur)" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          <g>
            <path d="M44 17 C44 12 46 10 49 8.5" stroke="#4d7a3d" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <ellipse cx="46.6" cy="10.4" rx="3.2" ry="1.7" fill="#6fa14f" transform="rotate(-35 46.6 10.4)" />
            <ellipse cx="49.8" cy="8" rx="2.8" ry="1.5" fill="#86b866" transform="rotate(20 49.8 8)" />
          </g>
          <ellipse cx="44" cy="32" rx="17.5" ry="14.8" fill="var(--c-fur)" />
          <path d="M31 27 C34 20 42 18 50 20" stroke="var(--c-fur-light)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".55" />
          <ellipse cx="51.5" cy="38" rx="8.5" ry="6.4" fill="var(--c-cream)" />
          <circle cx="35.5" cy="38.5" r="3.1" fill="var(--c-blush)" opacity=".6" />
          <g className={styles.eye}>
            <circle cx="40" cy="29" r="5.4" fill="var(--c-eye)" />
            <circle className={styles.pupil} cx="41.2" cy="29.4" r="3" fill="var(--c-pupil)" />
            <circle cx="42.2" cy="28.1" r="1.05" fill="#fff" />
            <ellipse className={styles.lid} cx="40" cy="29" rx="5.7" ry="5.7" fill="var(--c-fur)" />
          </g>
          <g className={styles.eye}>
            <circle cx="52" cy="28.4" r="5.8" fill="var(--c-eye)" />
            <circle className={styles.pupil} cx="53.2" cy="28.9" r="3.2" fill="var(--c-pupil)" />
            <circle cx="54.3" cy="27.5" r="1.15" fill="#fff" />
            <ellipse className={styles.lid} cx="52" cy="28.4" rx="6.1" ry="6.1" fill="var(--c-fur)" />
          </g>
          <path d="M35.5 22.6 L44 25 M47 24.2 L57 21.6" stroke="var(--c-fur-dark)" strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="58" cy="34.6" rx="2.3" ry="1.8" fill="var(--c-nose)" />
          <path d="M48.5 40 Q53.5 45.6 59.5 39.2" stroke="var(--c-nose)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M52.4 42.2 l1.1 3.1 l1.5-3.4 z" fill="#fffbee" stroke="var(--c-nose)" strokeWidth=".5" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}