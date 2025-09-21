#!/bin/sh
set -e

# Navigate to the project directory
cd /app/MusicSharing.Site

echo "Installing dependencies..."
# Using --force to tolerate potential peer conflicts in CI
npm install --force

# Create or modify environment configuration if API_URL is provided
if [ -n "$API_URL" ]; then
  echo "Configuring API URL: $API_URL"
  mkdir -p src/environments
  echo "export const environment = { production: false, apiUrl: '$API_URL' };" > src/environments/environment.ts
  echo "export const environment = { production: true,  apiUrl: '$API_URL' };" > src/environments/environment.prod.ts
fi

echo "Starting Angular application..."
exec npm start -- --host 0.0.0.0 --disable-host-check