#!/bin/bash

echo "Setting up authentication system..."

# Install dependencies
echo "Installing dependencies..."
npm install jsonwebtoken
npm install @types/jsonwebtoken --save-dev
npm install ts-node --save-dev

# Initialize database with users table
echo "Initializing database..."
npm run init-db

# Create admin user
echo "Creating admin user..."
npm run create-admin

echo "Authentication setup complete!"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "You can change these by setting ADMIN_USERNAME and ADMIN_PASSWORD environment variables."
