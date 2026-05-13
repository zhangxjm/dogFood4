#!/bin/sh
set -e

mkdir -p /app/data

echo "Starting server..."
npm run dev
