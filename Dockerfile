# ---------- Stage 1: Build Angular App ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY MusicSharing.Site/package*.json ./
RUN npm ci --no-audit --no-fund
COPY MusicSharing.Site/ ./
ARG API_URL
ENV API_URL=${API_URL}
RUN mkdir -p src/environments && \
    printf "export const environment = { production: true, apiUrl: '%s' };\n" "$API_URL" > src/environments/environment.prod.ts
RUN npm run build -- --configuration production --output-path=dist/music-sharing.site

# Copy files from browser folder to parent output directory
RUN cp -r dist/music-sharing.site/browser/* dist/music-sharing.site/

# ---------- Stage 2: Runtime (Nginx) ----------
FROM nginx:1.27-alpine

# Store built assets in a staging directory
COPY --from=builder /app/dist/music-sharing.site /opt/site

# Prepare (empty) target directory for possible bind mount
RUN rm -rf /usr/share/nginx/html/* && mkdir -p /usr/share/nginx/html

# SPA nginx config (same as before)
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
 '}' > /etc/nginx/conf.d/default.conf

# Entry script to populate html if empty
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
VOLUME ["/usr/share/nginx/html"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]