#!/bin/bash
# Installs (or reinstalls) the GitHub pull-only sync on this Mac.
#   ./install.sh            install / update, runs every 15 minutes
#   ./install.sh uninstall  stop it and remove the installed files
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.shalone.github-sync"
BIN="$HOME/.local/bin/github-sync.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true

if [ "${1:-}" = "uninstall" ]; then
  rm -f "$BIN" "$PLIST"
  echo "Removed. Logs are left in ~/Library/Logs/github-sync*.log"
  exit 0
fi

mkdir -p "$(dirname "$BIN")" "$HOME/Library/LaunchAgents"
cp "$HERE/github-sync.sh" "$BIN"
chmod +x "$BIN"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$BIN</string></array>
  <key>StartInterval</key><integer>900</integer>
  <key>RunAtLoad</key><true/>
  <key>LowPriorityIO</key><true/>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/github-sync.err.log</string>
</dict></plist>
EOF

launchctl bootstrap "$DOMAIN" "$PLIST"
echo "Installed. Runs now and every 15 minutes. Log: ~/Library/Logs/github-sync.log"
