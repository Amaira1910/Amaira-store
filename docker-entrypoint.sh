#!/bin/sh
# ==========================================================================
# Fixes the one thing a Dockerfile cannot: volume ownership.
#
# `RUN mkdir -p /data && chown nextjs /data` in the image is undone the moment
# the platform mounts a real volume over /data — the mount arrives owned by
# root, so a non-root app gets SQLITE_CANTOPEN trying to create its database.
#
# Container start is the last moment we still have root, so ownership is fixed
# here and then privileges are dropped. The app itself never runs as root.
# ==========================================================================
set -e

DB_DIR="$(dirname "${DATABASE_PATH:-/data/amaira.db}")"

if [ ! -d "$DB_DIR" ]; then
  mkdir -p "$DB_DIR"
fi

# Only chown when it is actually wrong: on a large volume a recursive chown
# every boot is slow, and on a read-only mount it would fail the start.
OWNER="$(stat -c '%u' "$DB_DIR" 2>/dev/null || echo 0)"
if [ "$OWNER" != "1001" ]; then
  echo "[entrypoint] taking ownership of $DB_DIR (was uid $OWNER)"
  chown -R 1001:1001 "$DB_DIR" || echo "[entrypoint] WARNING: could not chown $DB_DIR — is the mount read-only?"
fi

# Drop to the unprivileged user for the app itself.
exec su-exec 1001:1001 "$@"
