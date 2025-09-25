# Stage 1: Build Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first (for caching)
COPY MusicSharing.Site/package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the project
COPY MusicSharing.Site/ ./

# Set API URL for production
ARG API_URL
RUN mkdir -p src/environments && \
    echo "export const environment = { production: true, apiUrl: '$API_URL' };" > src/environments/environment.prod.ts

# Build Angular for production
RUN npm run build -- --configuration production --output-path=dist/music-sharing.site

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output to Nginx html folder
COPY --from=builder /app/dist/music-sharing.site /usr/share/nginx/html

# Optional: copy custom Nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
