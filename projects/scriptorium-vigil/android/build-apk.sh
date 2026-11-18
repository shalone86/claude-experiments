#!/bin/bash
# Builds a signed debug APK of the game without Gradle or Android Studio.
# Needs: openjdk@17 (Homebrew) and the Android SDK with platforms;android-34 and build-tools;34.0.0.
set -euo pipefail
cd "$(dirname "$0")"

JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BT="$SDK/build-tools/34.0.0"
JAR="$SDK/platforms/android-34/android.jar"
KEY="$HOME/.android/debug.keystore"
export PATH="$JAVA_HOME/bin:$PATH"
VERSION_CODE="$(date +%y%m%d%H)"       # rises every build so new APKs install over old ones
VERSION_NAME="$(date +%Y.%m.%d-%H%M)"

python3 ../build.py
rm -rf build && mkdir -p build/assets build/classes build/res
cp ../scriptorium-vigil.html build/assets/index.html

"$BT/aapt2" compile --dir res -o build/res/res.zip
"$BT/aapt2" link -o build/unsigned.apk -I "$JAR" --manifest AndroidManifest.xml \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" \
  -A build/assets build/res/res.zip

javac -source 8 -target 8 -Xlint:-options -bootclasspath "$JAR" -d build/classes \
  $(find src -name '*.java')
"$BT/d8" --min-api 24 --output build $(find build/classes -name '*.class')
(cd build && zip -q unsigned.apk classes.dex)

"$BT/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
if [ ! -f "$KEY" ]; then
  mkdir -p "$(dirname "$KEY")"
  keytool -genkeypair -keystore "$KEY" -storepass android -keypass android -alias androiddebugkey \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi
"$BT/apksigner" sign --ks "$KEY" --ks-pass pass:android --key-pass pass:android \
  --out scriptorium-vigil.apk build/aligned.apk
"$BT/apksigner" verify scriptorium-vigil.apk
echo "Built android/scriptorium-vigil.apk ($VERSION_NAME, $(du -h scriptorium-vigil.apk | cut -f1))"
