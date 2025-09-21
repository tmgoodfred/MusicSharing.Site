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

# Source the app directory variable and use npm install with additional options
RUN if [ -f "/tmp/app_dir.sh" ]; then \
      source /tmp/app_dir.sh; \
      cd $APP_DIR; \
      # Install all dependencies with legacy peer deps flag to handle version mismatches
      npm install --legacy-peer-deps; \
      # Build with production flag
      npm run build -- --configuration production; \
    else \
      # Fallback to root directory
      npm install --legacy-peer-deps; \
      npm run build -- --configuration production; \
    fi

# Run stage
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy the build output to replace the default nginx contents
# Based on the build output we saw, we know exactly where to find the files
COPY --from=build /app/MusicSharing.Site/dist/music-sharing.site/ .

EXPOSE 6543

# Copy a startup script to initialize environment variables if needed
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]