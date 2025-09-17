# ============================
# Base image
# ============================
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# ============================
# Development stage
# ============================
FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# ============================
# Build stage
# ============================
FROM base AS build
ENV NODE_ENV=production
RUN npm run build

# ============================
# Production stage
# ============================
FROM node:22-alpine AS production
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built files from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/.env ./.env

# Expose port
EXPOSE 3333

CMD ["node", "build/server.js"]


# ============================
# Health check endpoint
# ============================
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/health/liveness || exit 1