# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/auth-api/package.json ./apps/auth-api/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/shared-types/ ./packages/shared-types/
COPY packages/shared-utils/ ./packages/shared-utils/
COPY apps/auth-api/ ./apps/auth-api/

# Build packages
RUN cd packages/shared-types && bun run build
RUN cd packages/shared-utils && bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist
COPY --from=builder /app/packages/shared-utils/package.json ./packages/shared-utils/
COPY --from=builder /app/apps/auth-api ./apps/auth-api
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/apps/auth-api/data

WORKDIR /app/apps/auth-api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:4000/health/live || exit 1

EXPOSE 4000

CMD ["bun", "src/index.ts"]
