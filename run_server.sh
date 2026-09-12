#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

# Jekyll 3.9/pathutil 0.16 cannot start its WSL watcher on Ruby 3.
# Rebuild by stopping (Ctrl+C) and rerunning this script after edits.
exec bundle exec jekyll serve --host 0.0.0.0 --port 4000 "$@" --no-watch
