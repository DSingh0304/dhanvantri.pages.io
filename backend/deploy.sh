#!/bin/bash

# Update script for the Dhanvantri Healthcare Platform API

# Stop and remove existing containers
docker-compose down

# Pull latest changes
git pull

# Build and start containers
docker-compose up -d

# Seed database with sample data (if needed)
# docker-compose exec api npm run seed

echo "Deployment complete! The API is running at https://api.ysinghc.me"
