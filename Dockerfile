# Multi-stage build for client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Server stage
FROM node:20-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm ci

COPY server/ .

# Copy built client to serve as static files
COPY --from=client-build /app/client/dist ./public

EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
