#!/bin/bash

# Usage: ./stop.sh [PORT]
# Default port is 3000 if not provided
PORT=${1:-3000}
echo "🔍 Checking for process on port: $PORT"

# Try lsof first
PID=$(lsof -t -i tcp:$PORT 2>/dev/null)

# Fallback to ss
if [[ -z "$PID" ]]; then
  PID=$(ss -ltnp 2>/dev/null | grep ":$PORT" | awk '{print $NF}' | cut -d',' -f2 | cut -d'=' -f2)
fi

# Fallback to netstat (for portability)
if [[ -z "$PID" ]]; then
  PID=$(netstat -ltnp 2>/dev/null | grep ":$PORT" | awk '{print $7}' | cut -d'/' -f1)
fi

# Final check
if [[ -z "$PID" ]]; then
  echo "✅ No process found on port $PORT. Nothing to kill."
  exit 0
fi

# Loop through all PIDs found
for p in $PID; do
  if [[ "$p" =~ ^[0-9]+$ ]]; then
    echo "⚠️ Found process with PID: $p. Attempting to terminate..."

    # Try graceful termination first
    kill -15 "$p" 2>/dev/null
    sleep 2

    # If still alive, force kill
    if kill -0 "$p" 2>/dev/null; then
      kill -9 "$p" 2>/dev/null
    fi

    # Report result
    if [[ $? -eq 0 ]]; then
      echo "✅ Successfully killed process $p on port $PORT."
    else
      echo "❌ Failed to kill process $p."
    fi
  else
    echo "❌ Invalid PID detected: $p"
  fi
done
