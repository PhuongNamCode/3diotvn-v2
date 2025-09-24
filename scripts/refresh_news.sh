#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
PAYLOAD='{categories:[Communications,IoT,Embedded,AI,Hardware]}'
curl -sS -X POST "$BASE_URL/api/news/refresh" -H "Content-Type: application/json" -d "$PAYLOAD" | cat
