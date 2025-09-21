# Use a specific version of Node that's compatible with Angular 17
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Create a shell script that will try to build and serve the app
RUN echo '#!/bin/sh\n\
cd MusicSharing.Site\n\
echo "Installing dependencies..."\n\
npm install --force\n\
echo "Starting development server..."\n\
npm start -- --host 0.0.0.0 --disable-host-check\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port 4200 (Angular default dev server port)
EXPOSE 4200

# Start the application
CMD ["/app/start.sh"]