#!/bin/sh
# Builds Tile Forge and publishes it to https://shalonely.com/tileforge/
set -e
cd "$(dirname "$0")/.."
python3 build.py
rm -rf web/public && mkdir -p web/public/tileforge
cp tile-forge.html web/public/tileforge/index.html
# its own app: manifest, icons and service worker, all scoped to /tileforge/
cp web/app/manifest.webmanifest web/app/sw.js web/app/icon-192.png web/app/icon-512.png web/app/apple-touch-icon.png web/public/tileforge/
cd web && npx --yes wrangler@4.164.0 deploy
echo "Live: https://shalonely.com/tileforge/"
