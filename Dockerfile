# Multi-stage build for React/Vite app
# Stage 1: Build the application
# Note: Vite 7.2.2 requires Node 20.19.0 or >=22.12.0
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for environment variables
ARG VITE_RSVP_API_URL
ENV VITE_RSVP_API_URL=$VITE_RSVP_API_URL

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start nginx (nginx.conf already configured for port 8080)
CMD ["nginx", "-g", "daemon off;"]

