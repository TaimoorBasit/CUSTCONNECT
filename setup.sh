#!/bin/bash

# CustConnect Deployment Script
echo "🚀 Starting CustConnect deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MySQL is installed (optional check, mysql client might not be in path)
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found in PATH. Please ensure MySQL is running."
fi

echo "✅ Environment check done"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Set up environment files
echo "⚙️ Setting up environment files..."
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "📝 Created backend/.env from template"
    echo "⚠️  Please edit backend/.env with your MySQL credentials"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.local.example frontend/.env.local
    echo "📝 Created frontend/.env.local from template"
fi

# Database setup
echo "🗄️ Setting up database..."
cd backend

# Run migrations/push for MySQL
echo "🔄 Syncing database schema..."
npx prisma generate
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Database sync failed"
    exit 1
fi

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

if [ $? -ne 0 ]; then
    echo "❌ Database seeding failed"
    exit 1
fi

echo "✅ Database setup completed"

cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

cd ..

echo ""
echo "🎉 CustConnect setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Start development servers: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Default credentials:"
echo "Super Admin: admin@custconnect.com / admin123"
echo "Student: student1@edu.pk / admin123"
echo ""
echo "📚 For more information, see SETUP.md"
















