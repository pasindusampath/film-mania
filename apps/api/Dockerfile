FROM node:18-alpine AS base

# Enable Corepack for Yarn
RUN corepack enable && corepack prepare yarn@4.0.2 --activate

# Build stage
FROM base AS builder
WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY libs/shared/package.json ./libs/shared/
COPY libs/shared/tsconfig.json ./libs/shared/
COPY libs/shared/project.json ./libs/shared/
COPY tsconfig.base.json ./

# Install dependencies (including dev dependencies for build)
WORKDIR /app/apps/api
RUN yarn workspaces focus
WORKDIR /app

# Copy source code
COPY apps/api/src ./apps/api/src
COPY libs/shared/src ./libs/shared/src

# Build shared library first
RUN echo "Building shared library..." && \
    yarn workspace @nx-mono-repo-deployment-test/shared build && \
    echo "Shared library built successfully"

# Build API
WORKDIR /app/apps/api
RUN echo "Building API..." && \
    yarn build && \
    echo "API built successfully" && \
    ls -la dist/

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
# Copy built shared library files to the src location (where symlink expects them)
COPY --from=builder /app/dist/libs/shared/libs/shared/src ./libs/shared/src

# Set environment
ENV NODE_ENV=production
ENV PORT=3013

USER nodejs

EXPOSE 3013

# Note: Check actual path in dist folder
# If nested: dist/apps/api/src/main.js or just dist/main.js
CMD ["node", "dist/apps/api/src/main.js"]
