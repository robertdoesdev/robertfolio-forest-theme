/**
 * "Bramble" — an original woodland creature: part fluffy squirrel, part tiny
 * gremlin, part forest spirit. Hand-built SVG so it can be posed with CSS
 * transforms only. Drawn facing right; the parent flips it with scaleX.
 */
export function CreatureArt() {
  return (
    <svg className="c-svg" viewBox="0 0 80 80" focusable="false" aria-hidden="true">
      {/* big fluffy tail */}
      <g className="c-tail">
        <path
          d="M27 58 C6 62 0 38 8 24 C13 14 25 15 23 26 C22 33 15 37 19 46 C21 51 27 50 31 53 Z"
          fill="var(--c-fur)"
        />
        <path d="M13 30 C14 24 19 22 21 26 C19 30 15 33 16 38 C13 37 12 34 13 30 Z" fill="var(--c-fur-light)" opacity=".7" />
        <circle cx="11" cy="22" r="5.2" fill="var(--c-cream)" />
        <path d="M6 20 l2 2 M9 16 l1 3 M14 17 l-1 3" stroke="var(--c-fur-dark)" strokeWidth="1" strokeLinecap="round" opacity=".55" />
      </g>

      <g className="c-body">
        {/* far foot + far arm */}
        <ellipse className="c-foot c-foot-b" cx="47" cy="74" rx="6" ry="3.2" fill="var(--c-fur-dark)" />
        {/* body */}
        <ellipse cx="38" cy="55" rx="16" ry="15.5" fill="var(--c-fur)" />
        <ellipse cx="43" cy="58" rx="9" ry="10.5" fill="var(--c-cream)" />
        <path d="M24 50 C26 44 30 42 34 43" stroke="var(--c-fur-dark)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".4" />
        {/* near foot */}
        <ellipse className="c-foot c-foot-a" cx="32" cy="74" rx="6.6" ry="3.5" fill="var(--c-fur-dark)" />
        <g stroke="var(--c-cream)" strokeWidth="1" strokeLinecap="round" opacity=".9">
          <path d="M29 75 v1.4 M32 76 v1.4 M35 75 v1.4" />
        </g>
        {/* near arm / paw */}
        <g className="c-arm">
          <ellipse cx="47" cy="57" rx="3.3" ry="5" fill="var(--c-fur-dark)" transform="rotate(-14 47 57)" />
          <circle cx="48.4" cy="61.4" r="2.5" fill="var(--c-fur-dark)" />
        </g>

        {/* head */}
        <g className="c-head">
          {/* ears with tufts */}
          <g className="c-ear c-ear-b">
            <path d="M52 18 L61 5 L60 24 Z" fill="var(--c-fur-dark)" />
            <path d="M54 19 L59.5 10 L58.8 21.5 Z" fill="var(--c-ear)" />
            <path d="M61 5 l2.4-3 M61 5 l.2-3.6" stroke="var(--c-fur-dark)" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          <g className="c-ear c-ear-a">
            <path d="M30 23 L27 6 L41 16.5 Z" fill="var(--c-fur)" />
            <path d="M31.5 21 L29.4 10.6 L38 17 Z" fill="var(--c-ear)" />
            <path d="M27 6 l-2.6-2.6 M27 6 l.4-3.6" stroke="var(--c-fur)" strokeWidth="1.3" strokeLinecap="round" />
          </g>
          {/* moss sprig */}
          <g className="c-sprig">
            <path d="M44 17 C44 12 46 10 49 8.5" stroke="#4d7a3d" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <ellipse cx="46.6" cy="10.4" rx="3.2" ry="1.7" fill="#6fa14f" transform="rotate(-35 46.6 10.4)" />
            <ellipse cx="49.8" cy="8" rx="2.8" ry="1.5" fill="#86b866" transform="rotate(20 49.8 8)" />
          </g>
          <ellipse cx="44" cy="32" rx="17.5" ry="14.8" fill="var(--c-fur)" />
          <path d="M31 27 C34 20 42 18 50 20" stroke="var(--c-fur-light)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".55" />
          <ellipse cx="51.5" cy="38" rx="8.5" ry="6.4" fill="var(--c-cream)" />
          <circle cx="35.5" cy="38.5" r="3.1" fill="var(--c-blush)" opacity=".6" />
          {/* eyes */}
          <g className="c-eye c-eye-a">
            <circle cx="40" cy="29" r="5.4" fill="var(--c-eye)" />
            <circle className="c-pupil" cx="41.2" cy="29.4" r="3" fill="var(--c-pupil)" />
            <circle className="c-glint" cx="42.2" cy="28.1" r="1.05" fill="#fff" />
            <ellipse className="c-lid" cx="40" cy="29" rx="5.7" ry="5.7" fill="var(--c-fur)" />
          </g>
          <g className="c-eye c-eye-b">
            <circle cx="52" cy="28.4" r="5.8" fill="var(--c-eye)" />
            <circle className="c-pupil" cx="53.2" cy="28.9" r="3.2" fill="var(--c-pupil)" />
            <circle className="c-glint" cx="54.3" cy="27.5" r="1.15" fill="#fff" />
            <ellipse className="c-lid" cx="52" cy="28.4" rx="6.1" ry="6.1" fill="var(--c-fur)" />
          </g>
          {/* mischievous brow */}
          <path className="c-brow" d="M35.5 22.6 L44 25 M47 24.2 L57 21.6" stroke="var(--c-fur-dark)" strokeWidth="1.7" strokeLinecap="round" />
          {/* nose + grin + fang */}
          <ellipse cx="58" cy="34.6" rx="2.3" ry="1.8" fill="var(--c-nose)" />
          <g className="c-mouth">
            <path d="M48.5 40 Q53.5 45.6 59.5 39.2" stroke="var(--c-nose)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M52.4 42.2 l1.1 3.1 l1.5-3.4 z" fill="#fffbee" stroke="var(--c-nose)" strokeWidth=".5" strokeLinejoin="round" />
          </g>
          <path d="M55 36.6 l3.4.3 M55.4 38.2 l3.2 1" stroke="var(--c-fur-dark)" strokeWidth=".7" strokeLinecap="round" opacity=".5" />
        </g>
      </g>
    </svg>
  );
}

/** Foliage the creature hides behind. Purely decorative; only shown during a visit. */
export function CreatureBush() {
  return (
    <svg viewBox="0 0 84 66" focusable="false" aria-hidden="true" className="c-bush-svg">
      <ellipse cx="42" cy="58" rx="40" ry="14" fill="var(--bush-3)" />
      <circle cx="22" cy="40" r="19" fill="var(--bush-2)" />
      <circle cx="46" cy="32" r="22" fill="var(--bush-1)" />
      <circle cx="64" cy="43" r="17" fill="var(--bush-2)" />
      <circle cx="36" cy="46" r="17" fill="var(--bush-3)" />
      <path d="M14 30 q4-8 10-6 M40 14 q6-6 12 0 M60 32 q6-7 11-3 M30 42 q4-6 9-3" stroke="var(--bush-hi)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55" />
      <ellipse cx="30" cy="22" rx="5" ry="2.4" fill="var(--bush-hi)" opacity=".5" transform="rotate(-30 30 22)" />
      <ellipse cx="56" cy="20" rx="5" ry="2.4" fill="var(--bush-hi)" opacity=".45" transform="rotate(25 56 20)" />
    </svg>
  );
}
