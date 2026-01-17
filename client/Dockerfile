# Development Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent --no-audit --no-fund

# Copy source files (excluding node_modules, dist, etc. via .dockerignore)
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run development server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
