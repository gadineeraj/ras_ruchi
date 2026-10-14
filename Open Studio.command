#!/bin/bash
# Double-click to open the Studio, the editor for ras.ruchi.
# Keep this window open while you work. Close it when you're done.
cd "$(dirname "$0")" || exit 1
clear
echo "ras.ruchi Studio"
echo

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "The Studio needs Node.js, a free program from nodejs.org. Its download page will open now: install the LTS version, then double-click Open Studio again." buttons {"OK"} default button "OK" with title "ras.ruchi Studio"' >/dev/null 2>&1
  open "https://nodejs.org/en/download"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Getting ready for the first time. This takes a minute or two..."
  if ! npm install --no-audit --no-fund; then
    echo
    echo "Setup didn't finish. Check the internet connection, then double-click Open Studio again."
    read -n 1 -s -r -p "Press any key to close."
    exit 1
  fi
fi

URL="http://localhost:3200/studio/"
if curl -s -o /dev/null "$URL"; then
  echo "The Studio is already running. Opening it..."
  open "$URL"
  exit 0
fi

echo "Starting the Studio. It opens in your browser in a moment."
echo "Keep this window open while you work; close it to stop the Studio."
echo
( for _ in $(seq 1 180); do
    if [ "$(curl -s -o /dev/null -w "%{http_code}" "$URL")" = "200" ]; then open "$URL"; break; fi
    sleep 1
  done ) &
npm run studio
