#!/bin/bash

# Deploy script for CardZen
echo "🚀 Deploying CardZen application..."

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down

# Build and start the new containers
echo "Building and starting new containers..."
docker-compose up -d --build

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ CardZen deployment completed successfully!"
    echo "🌐 Application is running at http://localhost:3000"
else
    echo "❌ Deployment failed. Check logs for more information."
    docker-compose logs
fi
