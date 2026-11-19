# github-sync

Keeps this Mac's copies of your GitHub repos up to date. Every 15 minutes (and at login) it finds
every repo under your home folder whose `origin` is `github.com/shalone86/...` and pulls the latest
commits for the branch that's checked out.

## Status and next steps

- **Status:** Installed and running on the main Mac (launch agent `com.shalone.github-sync`).
- **Last worked on:** 2026-11-19. Set up the pull-only sync; the first run updated 14 repos.
  regroup had an old uncommitted draft, which was stashed so it could catch up.
- **Next steps:**
  1. Optionally clone the shalone86 repos that aren't on this Mac yet (angelio, picoparish, etc.).
  2. Consider a weekly summary of repos it had to skip, so they don't sit stale unnoticed.

## What it does (and doesn't)

- **Pull only.** It fetches and fast-forwards. It never commits, pushes, or merges.
- **Skips repos with uncommitted changes** to tracked files, so it can't overwrite local work.
- **Skips diverged repos** (local commits not on GitHub) and logs them for you to sort out.
- Skips branches with no upstream and repos owned by other people (forks and third-party clones).
- Looks up to four folders deep under `~` and ignores `~/Library`, `node_modules` and `.Trash`,
  so it picks up newly cloned repos automatically.

## Install / update / remove

```bash
./install.sh
```

```bash
./install.sh uninstall
```

`install.sh` copies `github-sync.sh` to `~/.local/bin/` and writes the launch agent to
`~/Library/LaunchAgents/com.shalone.github-sync.plist`. Rerun it after changing the script.
To sync a different GitHub account, set `GITHUB_SYNC_OWNER` in the script or environment.

Needs `git` and the GitHub CLI (`gh auth login`), which supplies the credentials for fetching.

## Checking on it

```bash
tail -30 ~/Library/Logs/github-sync.log
```

Log lines are `pull` (updated, with commit count), `skip` (with the reason) or `FAIL` (fetch error).
Repos that were already up to date aren't logged.

```bash
~/.local/bin/github-sync.sh
```

runs a sync immediately.
