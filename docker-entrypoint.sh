#!/bin/sh

# Replace API URL with environment variable if provided
if [ -n "$API_URL" ]; then
  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://192.168.1.217:5000|$API_URL|g" {} \;
fi

# Start nginx
exec nginx -g 'daemon off;'