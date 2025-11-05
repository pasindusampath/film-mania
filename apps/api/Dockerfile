FROM node:18-alpine AS base

# Enable Corepack for Yarn
RUN corepack enable && corepack prepare yarn@4.0.2 --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY nx.json ./
COPY tsconfig.base.json ./
# Copy all workspace package.json files (required for workspace resolution)
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/project.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/
COPY libs/shared/tsconfig.json ./libs/shared/
COPY libs/shared/project.json ./libs/shared/

# Install dependencies (including dev dependencies for build)
RUN yarn install --immutable

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn

# Copy workspace configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy application files
COPY apps/api ./apps/api
COPY libs/shared ./libs/shared

# Build shared library first
RUN echo "Building shared library..." && \
    yarn workspace @nx-mono-repo-deployment-test/shared build && \
    echo "Shared library built successfully" && \
    ls -la dist/libs/shared/ || echo "Checking dist structure..."

# Build API using workspace command
RUN echo "Building API..." && \
    yarn workspace api build && \
    echo "API built successfully" && \
    ls -la apps/api/dist/ || (echo "Checking alternative dist locations..." && find . -name "main.js" -type f 2>/dev/null | head -10)

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built files and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# Copy shared library source (for package.json and structure)
COPY --from=builder /app/libs/shared/package.json ./libs/shared/package.json
COPY --from=builder /app/libs/shared/tsconfig.json ./libs/shared/tsconfig.json
# Copy built shared library files
COPY --from=builder /app/dist/libs/shared ./dist/libs/shared

# Set environment
ENV NODE_ENV=production
ENV PORT=3013

USER nodejs

EXPOSE 3013

# Try different possible paths for main.js
# Based on tsconfig: outDir: "./dist", include: ["src/**/*.ts"]
# Output should be: dist/src/main.js
# But package.json suggests: dist/main.js
CMD ["node", "dist/src/main.js"]
