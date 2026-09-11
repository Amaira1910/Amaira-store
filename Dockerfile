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
# su-exec lets the entrypoint drop from root to the app user after it has
# fixed the volume's ownership. Alpine's equivalent of gosu, ~20KB.
RUN apk add --no-cache su-exec

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/data/amaira.db

# Never run the app as root.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# No manual copy of better-sqlite3 is needed. Next's output tracing already
# places it in .next/standalone/node_modules, prebuilds included — and v13
# ships a self-contained linuxmusl-x64.node, which is the one Alpine loads.
#
# Earlier revisions copied it by hand along with `bindings` and
# `file-uri-to-path`. Those two are dependencies of better-sqlite3 v9 and
# earlier; v13 resolves ../prebuilds/<platform>.node directly and does not
# depend on them at all. The COPY simply failed: "file-uri-to-path: not found".

# Mount point for the SQLite file.
#
# Note: no `VOLUME` instruction. Railway rejects it outright ("docker VOLUME is
# not supported, use Railway Volumes") because it manages mounts itself, and
# on other platforms an anonymous volume here would shadow a real bind mount.
# Attach the volume at /data in your platform instead — see DEPLOY.md.
#
# Creating it here only helps when NO volume is mounted. When one is, the mount
# lands on top owned by root and this chown is irrelevant — which is exactly
# why the entrypoint re-does it at start-up.
RUN mkdir -p /data && chown nextjs:nodejs /data

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Deliberately NOT `USER nextjs`: the entrypoint needs root to take ownership
# of the mounted volume, and drops to uid 1001 before exec'ing the server.
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
