# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy everything first
COPY . .

# Determine where package.json is and set up the build directory
RUN if [ -f "package.json" ]; then \
      echo "Found package.json in root"; \
    elif [ -f "MusicSharing.Site/package.json" ]; then \
      echo "Found package.json in MusicSharing.Site/"; \
      cd MusicSharing.Site; \
      # Create a variable to remember our app directory
      echo "export APP_DIR=/app/MusicSharing.Site" > /tmp/app_dir.sh; \
    else \
      echo "package.json not found"; \
      exit 1; \
    fi

# Source the app directory variable and use npm install instead of npm ci
RUN if [ -f "/tmp/app_dir.sh" ]; then \
      source /tmp/app_dir.sh; \
      cd $APP_DIR; \
      npm install; \
      npm run build; \
    else \
      # Fallback to root directory
      npm install; \
      npm run build; \
    fi

# Run stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
# Try different possible output paths based on Angular's default structure
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist/browser /usr/share/nginx/html/ 2>/dev/null || true
COPY --from=build /app/MusicSharing.Site/dist/browser /usr/share/nginx/html/ 2>/dev/null || true
COPY --from=build /app/dist/music-sharing-site/browser /usr/share/nginx/html/ 2>/dev/null || true
COPY --from=build /app/MusicSharing.Site/dist/music-sharing-site/browser /usr/share/nginx/html/ 2>/dev/null || true

# Check if files were copied and exit if not
RUN if [ -z "$(ls -A /usr/share/nginx/html)" ]; then \
      echo "No files were copied to /usr/share/nginx/html. Build output was not found."; \
      exit 1; \
    fi

EXPOSE 6543

# Copy a startup script to initialize environment variables if needed
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]