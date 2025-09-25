# Stage 1: Build Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only the Angular project folder
COPY MusicSharing.Site/package*.json ./
COPY MusicSharing.Site/ ./

# Install dependencies
RUN npm install --force

# Build Angular for production
ARG API_URL
RUN mkdir -p src/environments && \
    echo "export const environment = { production: true, apiUrl: '$API_URL' };" > src/environments/environment.prod.ts
RUN npm run build -- --output-path=dist --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy Angular build output to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
