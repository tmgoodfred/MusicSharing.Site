#!/bin/sh
set -e

ORIGIN="/opt/site"
TARGET="/usr/share/nginx/html"

if [ ! -d "$ORIGIN" ]; then
  echo "ERROR: Origin directory $ORIGIN missing."
  exit 1
fi

echo "Clearing and copying static assets into mounted directory..."
rm -rf "$TARGET"/*
cp -R "${ORIGIN}/." "$TARGET/"

exec nginx -g 'daemon off;'