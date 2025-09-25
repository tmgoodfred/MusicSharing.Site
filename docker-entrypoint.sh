#!/bin/sh
set -e

ORIGIN="/opt/site"
TARGET="/usr/share/nginx/html"

if [ ! -d "$ORIGIN" ]; then
  echo "ERROR: Origin directory $ORIGIN missing."
  exit 1
fi

if [ -z "$(ls -A "$TARGET")" ]; then
  echo "Populating static assets into mounted directory..."
  cp -R "${ORIGIN}/." "$TARGET/"
else
  echo "Target already populated; skipping copy."
fi

exec nginx -g 'daemon off;'