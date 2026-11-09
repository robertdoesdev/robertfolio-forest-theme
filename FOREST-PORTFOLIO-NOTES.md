# Robertfolio — implementation notes

This adaptation keeps the existing Next.js / React / TypeScript foundation and the original portfolio's typography and general section flow while making the experience specific to Robert Ocran.

## Implemented in this version

- Cinematic forest atmosphere with a restrained day/night toggle; moon/sun position and scene lighting respond to the selected time.
- Subtle fireflies at night and distant birds in daylight. Removed the foreground character to keep the environment less toy-like.
- The explore map has been removed. The forest scene is the centrepiece; header and menu navigation are unchanged. Design Studio is shown as a muted, non-interactive "SOON" item (menu and Selected Work).
- "Bramble", an original SVG woodland creature, lives in a fixed click-through layer: it peeks from foliage, runs across, and at night jumps on the hero name (squash/stretch overlay) and occasionally nibbles a letter (mask overlay; the real `<h1>` is never edited). It startles on pointer approach / tap, and reacts to the day/night toggle. Disabled under reduced motion.
- Day/night toggle shows short, action-specific messages on hover/focus (and briefly after a tap on touch).
- Tech Stack: a tilted wall of icon tiles whose columns glide in opposite directions beside a text list of the same technologies (from `SKILLS`). Pauses on hover and off-screen; static under reduced motion.
- The "Hire Me" hero button was removed. Project cleanup removed the unused game, keyboard, realtime chat, radial menu and template-era assets.
- Web Projects contains Robertfolio, SideQuest, OnTrack and a clearly marked Stash placeholder.
- Skills list matches the technologies supplied by Robert: JavaScript, TypeScript, HTML, CSS, React, Next.js, Tailwind CSS, Node.js, PostgreSQL, MongoDB, Git, GitHub and npm.
- Experience entries reuse the experience descriptions already present in the supplied folder.
- Hero and contact areas link to the supplied LinkedIn profile, GitHub profile and WhatsApp number.
- Replaced the template owner's résumé page and Open Graph image with Robertfolio-specific content. The résumé page uses the browser's Print / Save as PDF flow and labels itself as a working version.
- Removed template-era live cursors, visitor presence/chat, game/easter-egg overlays, GitHub stars display and external template analytics calls.
- Contact form opens a prefilled WhatsApp message while no recipient email is configured. To enable direct email delivery, set `email` in `src/data/config.ts` and add `RESEND_API_KEY` to the deployment environment.

## Before publishing

1. Review the experience wording and add verified education, dates or formal employment details as appropriate.
2. Replace the Design Studio "SOON" items with real work when ready.
3. Add Stash's real description, screenshots and live/repository links when ready.
4. Set the canonical domain in `src/data/config.ts` after choosing the production host.
5. Run `corepack pnpm typecheck` and `corepack pnpm build` after installing dependencies.

## Validation status

All 154 TypeScript/TSX source files passed a syntax-transpilation check, and all 65 SVG files passed XML parsing. A full typecheck/build could not be completed in this environment because dependencies are not present in the uploaded archive and the package manager download was blocked by network DNS failure. The archive does not include `node_modules`.
