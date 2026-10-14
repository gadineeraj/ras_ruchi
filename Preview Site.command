#!/bin/bash
# Double-click to build the site exactly as it will be published, then look at
# it in your browser. Nothing is published; close this window when you're done.
cd "$(dirname "$0")" || exit 1
clear
echo "Building the finished site. This takes about a minute..."
echo
if ! command -v node >/dev/null 2>&1; then
  open "https://nodejs.org/en/download"
  exit 1
fi
[ -d node_modules ] || npm install --no-audit --no-fund
if ! npm run build; then
  echo
  echo "The site didn't build. Open the Studio and press Publish to see what needs fixing."
  read -n 1 -s -r -p "Press any key to close."
  exit 1
fi
( sleep 1; open "http://localhost:3300/" ) &
echo
echo "The finished site is open at http://localhost:3300 . Close this window when you're done."
npm run preview
