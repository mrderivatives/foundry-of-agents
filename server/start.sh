#!/bin/sh
set -e

echo "Running migrations..."
./migrate || echo "Migration failed (DB may not be ready yet), continuing..."

echo "Starting server..."
exec ./server
