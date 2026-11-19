#!/bin/bash
# Pull-only sync: fast-forwards every shalone86 GitHub repo under ~ to match origin.
# Never commits or pushes. Skips repos with uncommitted changes or diverged history.
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GIT_TERMINAL_PROMPT=0
OWNER="${GITHUB_SYNC_OWNER:-shalone86}"
LOG="$HOME/Library/Logs/github-sync.log"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

# keep the log from growing forever
[ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 5000 ] && tail -n 2000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"

echo "$(ts) --- sync start" >> "$LOG"
find "$HOME" -maxdepth 4 \( -name Library -o -name node_modules -o -name .Trash -o -name .cache \) -prune \
     -o -name .git -type d -print 2>/dev/null | while read -r gitdir; do
  repo="$(dirname "$gitdir")"
  url="$(git -C "$repo" remote get-url origin 2>/dev/null)" || continue
  echo "$url" | grep -qiE "github\.com[/:]$OWNER/" || continue

  if ! git -C "$repo" fetch --prune --quiet origin 2>>"$LOG"; then
    echo "$(ts) FAIL  $repo (fetch failed)" >> "$LOG"; continue
  fi
  git -C "$repo" rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1 || { echo "$(ts) skip  $repo (no upstream)" >> "$LOG"; continue; }

  behind=$(git -C "$repo" rev-list --count 'HEAD..@{u}')
  [ "$behind" -eq 0 ] && continue
  if [ -n "$(git -C "$repo" status --porcelain --untracked-files=no)" ]; then
    echo "$(ts) skip  $repo ($behind behind, has uncommitted changes)" >> "$LOG"; continue
  fi
  if git -C "$repo" merge --ff-only --quiet '@{u}' 2>>"$LOG"; then
    echo "$(ts) pull  $repo (+$behind)" >> "$LOG"
  else
    echo "$(ts) skip  $repo ($behind behind, diverged - needs manual merge)" >> "$LOG"
  fi
done
echo "$(ts) --- sync done" >> "$LOG"
