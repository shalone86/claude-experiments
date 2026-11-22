#!/bin/sh
# Builds Tile Forge and publishes it to https://shalonely.com/tileforge/
set -e
cd "$(dirname "$0")/.."
python3 build.py
rm -rf web/public && mkdir -p web/public/tileforge
cp tile-forge.html web/public/tileforge/index.html
cd web && npx --yes wrangler@4.164.0 deploy
echo "Live: https://shalonely.com/tileforge/"
