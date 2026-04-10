#!/bin/sh
set -e

echo "Running migrations..."
./migrate || echo "Migration failed (DB may not be ready yet), continuing..."

echo "Starting worker..."
./worker &

echo "Starting server..."
exec ./server
