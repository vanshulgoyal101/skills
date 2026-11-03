#!/usr/bin/env bash
# One git worktree per issue: branch work/issue-<n> from origin/<baseBranch> in <worktreeRoot>/<n>, then
# node_modules (when the repo has a package-lock.json) cloned from a per-lockfile-hash cache: copy-on-write on
# macOS APFS (cp -c) and on Linux reflink filesystems (cp --reflink=auto), else `npm ci` (which also fills the
# cache for the next worktree). Prints the worktree path on the last line.
#   scripts/wt.sh <issue-number> [base-branch]
# worktreeRoot and baseBranch come from scripts/team.config.json when present (defaults ~/work-wt, next).
# WT_SKIP_INSTALL=1 skips node_modules entirely. WT_CACHE_DIR overrides the cache location.
set -euo pipefail

usage() { echo 'Usage: scripts/wt.sh <issue-number> [base-branch]' >&2; exit 2; }
[[ $# -ge 1 && $# -le 2 && "$1" =~ ^[0-9]+$ ]] || usage

issue="$1"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(git -C "$script_dir" rev-parse --show-toplevel)"
config="$script_dir/team.config.json"

root='~/work-wt'
base_branch='next'
if [[ -f "$config" ]] && command -v node >/dev/null 2>&1; then
  # One value per line; a bad config is an error, not a silent default.
  { read -r root; read -r base_branch; } < <(node -e '
    const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    console.log(c.worktreeRoot || "~/work-wt"); console.log(c.baseBranch || "next");' "$config")
fi
root="${root/#\~/$HOME}"
base="${2:-$base_branch}"
base="${base#origin/}"
target="$root/$issue"
branch="work/issue-$issue"

if [[ -e "$target" ]]; then
  echo "Worktree path already exists: $target" >&2
  exit 1
fi
if git -C "$repo" show-ref --verify --quiet "refs/heads/$branch"; then
  echo "Branch $branch already exists; reuse it with: git -C $repo worktree add $target $branch" >&2
  exit 1
fi

git -C "$repo" fetch --quiet origin "$base"
if ! git -C "$repo" rev-parse --verify --quiet "origin/$base^{commit}" >/dev/null; then
  echo "Unknown base branch: origin/$base" >&2
  exit 1
fi
mkdir -p "$root"
git -C "$repo" worktree add --quiet -b "$branch" "$target" "origin/$base"
# Don't track the base: `git push -u origin HEAD` sets the branch's own upstream.
git -C "$target" branch --quiet --unset-upstream 2>/dev/null || true

clone_tree() { # <src> <dst>: copy-on-write where the filesystem allows, a plain copy otherwise.
  if [[ "$(uname -s)" == Darwin ]]; then
    cp -cR "$1" "$2" 2>/dev/null || cp -R "$1" "$2"
  else
    cp -R --reflink=auto "$1" "$2" 2>/dev/null || cp -R "$1" "$2"
  fi
}
hash_file() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d ' ' -f 1
  else sha256sum "$1" | cut -d ' ' -f 1; fi
}

if [[ -z "${WT_SKIP_INSTALL:-}" && -f "$target/package-lock.json" ]]; then
  if [[ "$(uname -s)" == Darwin ]]; then default_cache="$HOME/Library/Caches/agent-team/node_modules"
  else default_cache="${XDG_CACHE_HOME:-$HOME/.cache}/agent-team/node_modules"; fi
  cache="${WT_CACHE_DIR:-$default_cache}/$(hash_file "$target/package-lock.json")"
  # npm writes node_modules/.package-lock.json at the end of a complete install: a cache without it is partial.
  if [[ -f "$cache/.package-lock.json" ]] && clone_tree "$cache" "$target/node_modules"; then
    echo "node_modules cloned from $cache" >&2
  else
    rm -rf "$target/node_modules"
    (cd "$target" && npm ci --no-audit --no-fund) >&2
    # Fill the cache atomically, so a concurrent wt.sh never clones a half-written tree.
    mkdir -p "$(dirname "$cache")"
    tmp="$cache.tmp.$$"
    if [[ ! -e "$cache" && -f "$target/node_modules/.package-lock.json" ]] && clone_tree "$target/node_modules" "$tmp"; then
      mv "$tmp" "$cache" 2>/dev/null || rm -rf "$tmp"
    else
      rm -rf "$tmp"
    fi
  fi
fi

echo "$target"
