# ---------- Stage 1: Build Angular App ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies only (better caching)
COPY MusicSharing.Site/package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY MusicSharing.Site/ ./

# Build-time API URL (baked into bundle)
ARG API_URL
ENV API_URL=${API_URL}

# Generate prod environment file
RUN mkdir -p src/environments && \
    printf "export const environment = { production: true, apiUrl: '%s' };\n" "$API_URL" > src/environments/environment.prod.ts

# Build (adjust output path to keep it clean)
RUN npm run build -- --configuration production --output-path=dist/app

# ---------- Stage 2: Runtime (Nginx) ----------
FROM nginx:1.27-alpine

# Labels (optional metadata)
LABEL org.opencontainers.image.title="Music Sharing SPA" \
      org.opencontainers.image.source="https://github.com/tmgoodfred/MusicSharing.Site" \
      org.opencontainers.image.description="Angular frontend for Music Sharing"

# Remove default content
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist/app /usr/share/nginx/html

# (Optional) If you have a custom entrypoint script for env injection, copy it
# COPY docker-entrypoint.sh /docker-entrypoint.d/99-env.sh
# RUN chmod +x /docker-entrypoint.d/99-env.sh

# Provide an Nginx config with SPA fallback
RUN printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  server_name _;' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '  gzip on;' \
    '  gzip_types text/plain text/css application/javascript application/json image/svg+xml;' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '  location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|ttf)$ {' \
    '    add_header Cache-Control "public, max-age=31536000, immutable";' \
    '    try_files $uri =404;' \
    '  }' \
    '  error_page 500 502 503 504 /index.html;' \
    '}' \
    > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Optional volume so you can mount and inspect built files on host (e.g., Unraid)
VOLUME ["/usr/share/nginx/html"]

# Healthcheck (simple)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]