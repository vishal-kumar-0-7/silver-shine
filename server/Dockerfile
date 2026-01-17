# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for development)
RUN npm ci --silent --no-audit --no-fund

# Copy application code
COPY . .

# Expose port (adjust if your server uses a different port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error('Status: ' + r.statusCode)})"

# Start development server
CMD ["npm", "run", "dev"]