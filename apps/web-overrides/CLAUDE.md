# apps/web-overrides — Fork Layer

This package provides the mechanism to customize Figma Make components without editing the upstream files in `apps/web/`.

## How It Works

1. **FORK_REGISTRY.yaml** — Source of truth for all forked files
2. **vite-plugin-overrides.ts** — Vite plugin that intercepts imports at `enforce: 'pre'` and redirects to our overrides
3. **src/** — Override files (our customized versions of Figma components)
4. **.snapshots/** — Frozen copies of upstream files for drift detection

## Fork Types

### External Fork (recommended)
The original stays in `apps/web/`, our version lives in `apps/web-overrides/src/`:
```yaml
- path: apps/web/src/app/components/SomePage.tsx
  override: apps/web-overrides/src/components/SomePage.tsx
```

### Self-Fork (rare)
Edit the file in place in `apps/web/`. Only for `vite.config.ts`:
```yaml
- path: apps/web/vite.config.ts
  override: apps/web/vite.config.ts
```

## Adding a New Fork

1. Copy the upstream file:
   ```bash
   cp apps/web/src/app/components/Foo.tsx apps/web-overrides/src/components/Foo.tsx
   cp apps/web/src/app/components/Foo.tsx apps/web-overrides/.snapshots/Foo.tsx
   ```
2. Compute the hash:
   ```bash
   shasum -a 256 apps/web/src/app/components/Foo.tsx
   ```
3. Add entry to `FORK_REGISTRY.yaml`
4. Run `pnpm figma:check-forks` to verify
5. Make your changes in the override file

## Critical: Plugin Order in vite.config.ts

`figmaMakeOverrides` MUST come BEFORE other plugins (enforce: 'pre').
