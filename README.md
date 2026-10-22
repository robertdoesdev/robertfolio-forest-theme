# Robertfolio — Forest Edition

Robert Ocran's portfolio project: a designer and web developer portfolio with a living forest atmosphere, a day/night toggle and a mischievous woodland creature.

## Run locally

Requirements: Node.js 20.9+ and pnpm.

```bash
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:3000`.

## Main areas

- `src/data/config.ts` — name, metadata, public links and contact email.
- `src/data/constants.ts` — the current skills list and experience entries.
- `src/data/projects.tsx` — Web Projects cards and their descriptions/links.
- `src/components/sections/projects.tsx` — Web Projects cards; Design Studio is shown as a non-interactive "SOON" item.
- `src/components/creature/` — the forest creature (SVG art, animation engine, React shell).
- `src/components/sections/skills.tsx` — tech stack section (tilted tile wall + text list, driven by `SKILLS`).
- `src/lib/creature-messages.ts` — message sets + single-slot message store.
- `src/components/forest-scene.tsx` — ambient forest scene and day/night environment.
- `src/app/resume/resume-view.tsx` — résumé page with a browser Print / Save as PDF action.

## Before publishing

1. Review the experience wording and add any verified employment, education and dates you want to show.
2. When Design Studio is ready, replace the "SOON" items in `projects.tsx` and `header/config.ts`.
3. Add the correct Stash live link, repository and project description when ready.
4. Set `email` in `src/data/config.ts` and `RESEND_API_KEY` in the deployment environment if you want the form to send email. Until an email address is configured, the form opens a prefilled WhatsApp message instead.
5. Review the public domain in `config.site` before deploying.

## Checks

```bash
corepack pnpm typecheck
corepack pnpm build
```

The original template's visitor cursors, online presence/chat, game, Easter eggs, GitHub stars widget and template analytics have been disabled in this adaptation.
