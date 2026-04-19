#!/usr/bin/env bash
#
# sync-figma-make.sh
#
# Sync a fresh Figma Make export directly into apps/web/ on the current branch.
#
# Usage:
#   ./scripts/sync-figma-make.sh                          # sync from GitHub repo (default)
#   ./scripts/sync-figma-make.sh --github                 # explicit GitHub sync
#   ./scripts/sync-figma-make.sh --github --ref feat/x    # sync a specific branch/tag
#   ./scripts/sync-figma-make.sh <path-to-export.zip>     # sync from local zip
#   ./scripts/sync-figma-make.sh <path-to-export-dir>     # sync from local directory
#
# Environment:
#   FIGMA_GITHUB_REPO  — GitHub repo to sync from (default: YuudachiXMMY/Trackify-Figma)
#   FIGMA_GITHUB_REF   — Branch/tag to sync (default: main)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TARGET_DIR="apps/web"

# ----------------------------------------------------------------------------
# Defaults
# ----------------------------------------------------------------------------
FIGMA_GITHUB_REPO="${FIGMA_GITHUB_REPO:-YuudachiXMMY/Trackify-Figma}"
FIGMA_GITHUB_REF="${FIGMA_GITHUB_REF:-main}"

# ----------------------------------------------------------------------------
# Parse arguments
# ----------------------------------------------------------------------------
MODE=""       # "local" or "github"
SOURCE=""     # local path (zip or dir)
GH_REF="$FIGMA_GITHUB_REF"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --github)
      MODE="github"
      shift
      ;;
    --ref)
      GH_REF="${2:?--ref requires a branch/tag name}"
      shift 2
      ;;
    -*)
      echo "ERROR unknown flag: $1" >&2
      exit 1
      ;;
    *)
      MODE="local"
      SOURCE="$1"
      shift
      ;;
  esac
done

# No arguments → default to GitHub sync
if [[ -z "$MODE" ]]; then
  MODE="github"
fi

# Validate local source exists
if [[ "$MODE" == "local" && ! -e "$SOURCE" ]]; then
  echo "ERROR source path not found: $SOURCE" >&2
  exit 1
fi

# ----------------------------------------------------------------------------
# Files we maintain in apps/web/ that Figma Make never produces.
# These are stashed before the wipe and restored after the copy so we don't
# lose them on every sync.
# ----------------------------------------------------------------------------
PRESERVE_FILES=(
  "tsconfig.json"
  "index.html"
  "vite.config.ts"
  "CLAUDE.md"
  "Dockerfile"
  "nginx.prod.conf"
  # Add more here as needed
)

# ----------------------------------------------------------------------------
# 0. Pre-flight
# ----------------------------------------------------------------------------
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR working tree is dirty, commit or stash first" >&2
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  mkdir -p "$TARGET_DIR"
fi

# ----------------------------------------------------------------------------
# 1. Acquire the Figma Make export
# ----------------------------------------------------------------------------
CLONE_DIR=""
STASH_DIR="$(mktemp -d -t figma-make-preserve.XXXXXX)"
trap 'rm -rf "$STASH_DIR" ${CLONE_DIR:+"$CLONE_DIR"}' EXIT

if [[ "$MODE" == "github" ]]; then
  CLONE_DIR="$(mktemp -d -t figma-make-clone.XXXXXX)"
  echo "cloning ${FIGMA_GITHUB_REPO}@${GH_REF} → $CLONE_DIR ..."
  gh repo clone "$FIGMA_GITHUB_REPO" "$CLONE_DIR" -- --depth 1 --branch "$GH_REF" --single-branch
  SOURCE="$CLONE_DIR"
  echo "clone OK ($(du -sh "$CLONE_DIR" | cut -f1) total)"
fi

# If source is a zip, extract to a temp dir
EXPORT_DIR="$SOURCE"
if [[ "$SOURCE" == *.zip ]]; then
  EXPORT_DIR="$(mktemp -d -t figma-make-unzip.XXXXXX)"
  unzip -q "$SOURCE" -d "$EXPORT_DIR"
  trap 'rm -rf "$STASH_DIR" ${CLONE_DIR:+"$CLONE_DIR"} "$EXPORT_DIR"' EXIT
  echo "extracted zip to $EXPORT_DIR"
fi

# ----------------------------------------------------------------------------
# 2. Stash preserved files from apps/web/
# ----------------------------------------------------------------------------
for f in "${PRESERVE_FILES[@]}"; do
  src="$TARGET_DIR/$f"
  if [[ -e "$src" ]]; then
    mkdir -p "$STASH_DIR/$(dirname "$f")"
    cp -a "$src" "$STASH_DIR/$f"
    echo "stashed $src"
  fi
done

# ----------------------------------------------------------------------------
# 3. Remove all contents of apps/web/ except node_modules and .git
# ----------------------------------------------------------------------------
echo "cleaning $TARGET_DIR/ ..."
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 \
  ! -name 'node_modules' \
  ! -name '.git' \
  -exec rm -rf {} +

# ----------------------------------------------------------------------------
# 4. Copy the new Figma Make export into apps/web/
# ----------------------------------------------------------------------------
echo "copying new export into $TARGET_DIR/ ..."
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  "$EXPORT_DIR/" "$TARGET_DIR/"

# ----------------------------------------------------------------------------
# 5. Restore preserved files
# ----------------------------------------------------------------------------
for f in "${PRESERVE_FILES[@]}"; do
  if [[ -e "$STASH_DIR/$f" ]]; then
    mkdir -p "$TARGET_DIR/$(dirname "$f")"
    cp -a "$STASH_DIR/$f" "$TARGET_DIR/$f"
    echo "restored $TARGET_DIR/$f"
  fi
done

# ----------------------------------------------------------------------------
# 6. Show what changed
# ----------------------------------------------------------------------------
echo ""
echo "--- Changes summary ---"
git diff --stat "$TARGET_DIR/"
echo ""

CHANGED=$(git status --porcelain "$TARGET_DIR/" | wc -l | tr -d ' ')
if [[ "$CHANGED" == "0" ]]; then
  echo "INFO no changes detected after sync — apps/web/ is already up to date"
  exit 0
fi

echo "$CHANGED file(s) changed in $TARGET_DIR/"

# ----------------------------------------------------------------------------
# 7. Run drift detection on tracked forks
# ----------------------------------------------------------------------------
if [[ -f apps/web-overrides/FORK_REGISTRY.yaml ]]; then
  echo ""
  echo "checking fork drift..."
  pnpm figma:check-forks || {
    echo "WARN drift detected, review apps/web-overrides/FORK_REGISTRY.yaml"
  }
fi

# ----------------------------------------------------------------------------
# 8. Refresh dependencies
# ----------------------------------------------------------------------------
pnpm install

echo ""
echo "OK sync complete — changes are unstaged in $TARGET_DIR/"
echo "   review with:  git diff $TARGET_DIR/"
echo "   stage with:   git add $TARGET_DIR/"
echo "   commit with:  git commit -m 'chore(figma): sync $(date +%Y-%m-%d)'"
