# Use Node 18 (works well with Angular 17 dev server)
FROM node:18-alpine

WORKDIR /app

# Copy project
COPY . .

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Angular dev server port
EXPOSE 4200

# Use your entrypoint (installs deps, writes env, runs ng serve)
ENTRYPOINT ["/app/docker-entrypoint.sh"]