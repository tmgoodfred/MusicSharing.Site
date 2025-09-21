# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# First, try to detect where package.json is located
COPY . .

# Find the directory containing package.json (assuming it's somewhere in the project)
RUN if [ -f "package.json" ]; then \
      echo "Found package.json in root"; \
    elif [ -f "MusicSharing.Site/package.json" ]; then \
      echo "Found package.json in MusicSharing.Site/"; \
      cd MusicSharing.Site; \
    else \
      echo "package.json not found"; \
      exit 1; \
    fi

# Install dependencies
RUN npm ci

# Build the app
RUN npm run build

# Run stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
# Adjust this path based on your output directory from the build
COPY --from=build /app/dist/browser /usr/share/nginx/html
# If your output is in a different location, use something like:
# COPY --from=build /app/MusicSharing.Site/dist/browser /usr/share/nginx/html
# or
# COPY --from=build /app/dist/music-sharing-site/browser /usr/share/nginx/html

EXPOSE 6543

# Copy a startup script to initialize environment variables if needed
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]