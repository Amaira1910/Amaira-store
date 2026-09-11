# ==========================================================================
# Amaira — production image.
#
# Multi-stage so the runtime layer carries no compiler, no dev dependencies
# and no source. better-sqlite3 is a native module, so the build stage needs
# python3 and a C++ toolchain; the runtime stage needs only the compiled .node.
#
# The database lives on a MOUNTED VOLUME at /data. Without one, every deploy
# starts with an empty shop.
# ==========================================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------------------- deps
FROM base AS deps
WORKDIR /app
# Build tools for better-sqlite3's native compile step.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------------- build
FROM base AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ------------------------------------------------------------- runtime
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/data/amaira.db

# Never run the app as root.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# The standalone trace does not always pick up a native module's prebuilt
# binary, so copy better-sqlite3 across whole.
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/node_modules/bindings ./node_modules/bindings
COPY --from=build /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Mount point for the SQLite file. The directory is created and owned here so
# the app can write to it whether or not a volume is mounted over the top.
#
# Note: no `VOLUME` instruction. Railway rejects it outright ("docker VOLUME is
# not supported, use Railway Volumes") because it manages mounts itself, and
# on other platforms an anonymous volume here would shadow a real bind mount.
# Attach the volume at /data in your platform instead — see DEPLOY.md.
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
