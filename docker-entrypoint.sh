#!/bin/sh

# Navigate to the project directory
cd /app/MusicSharing.Site

# Create or modify environment configuration if API_URL is provided
if [ -n "$API_URL" ]; then
  echo "Configuring API URL: $API_URL"
  # Create environment files with the provided API URL
  echo "export const environment = { production: false, apiUrl: '$API_URL' };" > src/environments/environment.ts
  echo "export const environment = { production: true, apiUrl: '$API_URL' };" > src/environments/environment.prod.ts
fi

# Start the application
echo "Starting Angular application..."
npm start -- --host 0.0.0.0 --disable-host-check