# Multi-stage build for Angular
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY Appointment-Scheduler-UI/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY Appointment-Scheduler-UI/src ./src
COPY Appointment-Scheduler-UI/public ./public
COPY Appointment-Scheduler-UI/angular.json ./
COPY Appointment-Scheduler-UI/tsconfig*.json ./

# Build Angular application
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy nginx config
COPY Appointment-Scheduler-UI/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/appointment-scheduler-ui/browser .

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
