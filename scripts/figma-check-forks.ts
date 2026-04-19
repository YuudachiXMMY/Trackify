#!/usr/bin/env tsx
// Detect fork drift between Figma Make's upstream and our overrides.
//
// Run via `pnpm figma:check-forks`.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const REGISTRY = path.join(REPO_ROOT, 'apps/web-overrides/FORK_REGISTRY.yaml')

interface Fork {
  path: string
  override: string
  reason: string
  first_forked: string
  upstream: { hash: string; snapshot: string }
}

interface Registry {
  version: number
  forks: Fork[]
}

function sha256(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

if (!existsSync(REGISTRY)) {
  console.log('no FORK_REGISTRY.yaml found, nothing to check')
  process.exit(0)
}

const registry = yaml.load(readFileSync(REGISTRY, 'utf-8')) as Registry
let drifted = 0
let checked = 0

console.log('checking fork drift...\n')

for (const fork of registry.forks) {
  checked++
  const currentPath = path.join(REPO_ROOT, fork.path)
  const snapshotPath = path.join(REPO_ROOT, fork.upstream.snapshot)

  if (!existsSync(currentPath)) {
    console.log(`MISSING ${fork.path} (file disappeared from upstream?)`)
    drifted++
    continue
  }
  if (!existsSync(snapshotPath)) {
    console.log(`MISSING ${fork.upstream.snapshot} (snapshot lost)`)
    drifted++
    continue
  }

  if (fork.path === fork.override) {
    const snapHash = sha256(snapshotPath)
    if (snapHash === fork.upstream.hash) {
      console.log(`OK  ${fork.path} (self-fork, snapshot pinned)`)
    } else {
      console.log(
        `WARN ${fork.path} — snapshot hash does not match registry.upstream.hash\n` +
          `       snapshot: ${snapHash}\n` +
          `       registry: ${fork.upstream.hash}`
      )
      drifted++
    }
  } else {
    const currentHash = sha256(currentPath)
    if (currentHash === fork.upstream.hash) {
      console.log(`OK  ${fork.path} (upstream unchanged)`)
    } else {
      console.log(
        `DRIFT ${fork.path}\n` +
          `       expected: ${fork.upstream.hash}\n` +
          `       current:  ${currentHash}\n` +
          `       diff snapshot against current:\n` +
          `         diff ${fork.upstream.snapshot} ${fork.path}\n` +
          `       then port changes into ${fork.override}\n` +
          `       and update upstream.hash in FORK_REGISTRY.yaml`
      )
      drifted++
    }
  }
}

console.log(`\n${checked} fork(s) checked, ${drifted} drifted`)
process.exit(drifted === 0 ? 0 : 1)
