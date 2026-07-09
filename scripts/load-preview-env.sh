#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREVIEW_ENV="$ROOT/.env.preview.local"
ASC_ENV="$ROOT/appstore.apikey.env"

if [[ ! -f "$PREVIEW_ENV" ]]; then
  echo "Falta $PREVIEW_ENV — copia desde .env.preview.local.example" >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$PREVIEW_ENV"
set +a

if [[ -f "$ASC_ENV" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ASC_ENV"
  set +a
else
  echo "Aviso: sin appstore.apikey.env — eas puede pedir login Apple (copia desde appstore.apikey.env.example)" >&2
fi

SENTRY_ENV="$ROOT/sentry.build.env"
if [[ -f "$SENTRY_ENV" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$SENTRY_ENV"
  set +a
fi

echo "Variables preview cargadas."
if [[ -n "${EXPO_PUBLIC_API_SYNC_URL:-}" ]]; then
  echo "  EXPO_PUBLIC_API_SYNC_URL=$EXPO_PUBLIC_API_SYNC_URL"
fi
if [[ -n "${EXPO_ASC_KEY_ID:-}" ]]; then
  echo "  EXPO_ASC_KEY_ID=$EXPO_ASC_KEY_ID"
fi
if [[ -n "${SENTRY_AUTH_TOKEN:-}" ]]; then
  echo "  SENTRY_AUTH_TOKEN=*** (cargado)"
fi
