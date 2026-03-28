# ----- Stage 1: Build -----
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm build

# ----- Stage 2: Production runner -----
FROM node:20-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy only what is needed to run the server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/server.js"]
