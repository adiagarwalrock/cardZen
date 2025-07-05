#!/bin/bash

# Fix permissions for CardZen data directory
echo "🔧 Fixing permissions for CardZen data directory..."

# Check if the container is running
if ! docker ps | grep -q cardzen-app; then
    echo "❌ CardZen container is not running. Please start it first with: ./deploy.sh"
    exit 1
fi

# Fix permissions
echo "Setting proper ownership of data directory..."
docker exec -it cardzen-app sh -c "chown -R nextjs:nodejs /app/data"

echo "✅ Permissions fixed. Try restarting the application with: ./deploy.sh"
