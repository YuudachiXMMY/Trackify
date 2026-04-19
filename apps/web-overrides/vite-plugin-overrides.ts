import type { Plugin } from 'vite'
import path from 'path'
import { readFileSync, existsSync } from 'fs'
import yaml from 'js-yaml'

interface ForkEntry {
  path: string
  override: string
  reason: string
  first_forked: string
  upstream: {
    hash: string
    snapshot: string
  }
}

interface ForkRegistry {
  version: number
  forks: ForkEntry[]
}

/**
 * Vite plugin that intercepts imports targeting Figma Make files listed in
 * FORK_REGISTRY.yaml and redirects them to apps/web-overrides/ equivalents.
 *
 * Runs BEFORE Vite's default resolution (`enforce: 'pre'`) so relative imports
 * from inside apps/web/ (like `./components/Profile` in routes.tsx) can be
 * rewritten to the override file, without editing the original source.
 */
export function figmaMakeOverrides(repoRoot: string): Plugin {
  const registryPath = path.resolve(repoRoot, 'apps/web-overrides/FORK_REGISTRY.yaml')

  let overrideMap = new Map<string, string>()

  const loadRegistry = () => {
    if (!existsSync(registryPath)) {
      overrideMap = new Map()
      return
    }
    const raw = readFileSync(registryPath, 'utf-8')
    const parsed = yaml.load(raw) as ForkRegistry
    overrideMap = new Map(
      (parsed.forks ?? [])
        .filter((f) => f.path !== f.override) // skip self-forks (e.g. vite.config.ts)
        .map((f) => [
          path.resolve(repoRoot, f.path),
          path.resolve(repoRoot, f.override),
        ])
    )
  }

  loadRegistry()

  return {
    name: 'figma-make-overrides',
    enforce: 'pre',

    configureServer(server) {
      server.watcher.add(registryPath)
      server.watcher.on('change', (file) => {
        if (file === registryPath) {
          console.log('[overrides] FORK_REGISTRY.yaml changed, reloading')
          loadRegistry()
          server.ws.send({ type: 'full-reload' })
        }
      })
    },

    async resolveId(source, importer) {
      if (!importer) return null

      const importerDir = path.dirname(importer)
      const candidateBase = path.resolve(importerDir, source)

      const candidates = [
        candidateBase,
        `${candidateBase}.tsx`,
        `${candidateBase}.ts`,
        `${candidateBase}.jsx`,
        `${candidateBase}.js`,
        path.join(candidateBase, 'index.tsx'),
        path.join(candidateBase, 'index.ts'),
      ]

      for (const candidate of candidates) {
        const override = overrideMap.get(candidate)
        if (override) {
          return override
        }
      }
      return null
    },
  }
}
