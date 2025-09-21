#!/bin/sh
set -e
cd /app/MusicSharing.Site

echo "Installing dependencies..."
npm install --force

if [ -n "$API_URL" ]; then
  echo "Configuring API URL: $API_URL"
  mkdir -p src/environments
  echo "export const environment = { production: false, apiUrl: '$API_URL' };" > src/environments/environment.ts
  echo "export const environment = { production: true,  apiUrl: '$API_URL' };" > src/environments/environment.prod.ts
fi

PORT="${PORT:-8353}"
echo "Starting Angular application on port ${PORT}..."
exec npm start -- --host 0.0.0.0 --port "${PORT}" --disable-host-check