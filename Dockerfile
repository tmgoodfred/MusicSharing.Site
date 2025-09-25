# Stage 1: Build Angular app
FROM node:18-alpine AS build

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install --force

# Build Angular for production
ARG API_URL
RUN mkdir -p src/environments && \
    echo "export const environment = { production: true, apiUrl: '${API_URL}' };" > src/environments/environment.prod.ts && \
    npx ng build --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built Angular files to Nginx
COPY --from=build /app/MusicSharing.Site/dist/music-sharing.site /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
