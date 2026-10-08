#!/usr/bin/env bash
set -euo pipefail

mkdir -p /home/vscode/.local/share/zsh

chmod +x backend/mvnw

if ! command -v codex >/dev/null 2>&1; then
  bun add --global @openai/codex
fi

if [[ -f frontend/package-lock.json ]]; then
  npm ci --prefix frontend
fi

make install-hooks
