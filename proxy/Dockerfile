# Dockerfile for RSVP CORS Proxy Service
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server.js ./

# Build argument for Apps Script URL
ARG APPS_SCRIPT_URL
ENV APPS_SCRIPT_URL=$APPS_SCRIPT_URL

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]

