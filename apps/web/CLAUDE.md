# apps/web — Figma Make Frontend

**This directory is the Figma Make sync target. Its contents are READ-ONLY.**

## What This Means

- `pnpm figma:sync` will **wipe and replace** everything in this directory (except preserved files)
- **Never hand-edit** files in `src/` — your changes WILL be lost on the next sync
- To customize Figma-generated components, use `apps/web-overrides/`

## Preserved Files

These files survive a sync (stashed and restored automatically):
- `tsconfig.json` — TypeScript config we added
- `index.html` — Vite entry point
- `vite.config.ts` — THE ONE SANCTIONED SELF-FORK (contains override plugin + aliases)
- `CLAUDE.md` — This file
- `Dockerfile` — Production build
- `nginx.prod.conf` — Nginx SPA config

## Customizing Components

To override a Figma-generated component:
1. Copy the file to `apps/web-overrides/src/`
2. Make your changes in the copy
3. Register in `apps/web-overrides/FORK_REGISTRY.yaml`
4. The Vite plugin transparently redirects imports at build time

See `apps/web-overrides/CLAUDE.md` for detailed fork workflow.
