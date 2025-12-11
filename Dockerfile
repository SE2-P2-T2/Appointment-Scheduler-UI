# Multi-stage build for Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY angular.json ./
COPY tsconfig*.json ./

# Build Angular application
RUN npm run build

# Debug: list dist contents
RUN ls -la /app/dist/appointment-scheduler-ui/

# Serve with Nginx
FROM nginx:alpine

# Remove default nginx config and all default files
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application to nginx
COPY --from=build /app/dist/appointment-scheduler-ui/browser/ /usr/share/nginx/html/

# List what got copied
RUN ls -la /usr/share/nginx/html/

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
