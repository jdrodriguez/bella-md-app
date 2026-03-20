FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drizzle schema push — isolated in /migrate to avoid conflicts with standalone output
COPY --from=builder --chown=nextjs:nodejs /app/src/db/schema.ts /migrate/src/db/schema.ts
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts /migrate/drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json /migrate/tsconfig.json
RUN cd /migrate && npm init -y > /dev/null 2>&1 && npm install drizzle-kit drizzle-orm postgres > /dev/null 2>&1

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD cd /migrate && ./node_modules/.bin/drizzle-kit push --force && cd /app && node server.js
