# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/auth-ui/package.json ./apps/auth-ui/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/shared-types/ ./packages/shared-types/
COPY packages/shared-utils/ ./packages/shared-utils/
COPY apps/auth-ui/ ./apps/auth-ui/

# Build packages
RUN cd packages/shared-types && bun run build
RUN cd packages/shared-utils && bun run build

# Build Next.js app
WORKDIR /app/apps/auth-ui
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/apps/auth-ui/.next/standalone ./
COPY --from=builder /app/apps/auth-ui/.next/static ./apps/auth-ui/.next/static
COPY --from=builder /app/apps/auth-ui/public ./apps/auth-ui/public

EXPOSE 3000

ENV PORT=3000

CMD ["bun", "apps/auth-ui/server.js"]
