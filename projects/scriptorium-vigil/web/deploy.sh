#!/bin/sh
# Builds the game and the APK, then publishes both to https://shalonely.com/scriptorium/
set -e
cd "$(dirname "$0")/.."
python3 build.py
sh android/build-apk.sh
rm -rf web/public && mkdir -p web/public/scriptorium
cp scriptorium-vigil.html web/public/scriptorium/index.html
cp android/scriptorium-vigil.apk web/public/scriptorium/ScriptoriumVigil.apk
cd web && npx --yes wrangler@4.164.0 deploy
echo "Live: https://shalonely.com/scriptorium/"
