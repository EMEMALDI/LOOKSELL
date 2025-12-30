#!/bin/bash

# LookSell Quick Start Script
# This script helps you get started quickly with the platform

set -e

echo "🚀 LookSell Quick Start"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have version $NODE_VERSION."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker detected"
    USE_DOCKER=true
else
    echo "⚠️  Docker not found. Will use local databases."
    USE_DOCKER=false
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Setting up environment..."

# Create API .env if it doesn't exist
if [ ! -f "apps/api/.env" ]; then
    echo "📝 Creating API environment file..."
    cp apps/api/.env.example apps/api/.env

    # Generate JWT secrets
    JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    # Update .env with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-access-token-secret-here/$JWT_ACCESS_SECRET/" apps/api/.env
        sed -i '' "s/your-refresh-token-secret-here/$JWT_REFRESH_SECRET/" apps/api/.env
    else
        # Linux
        sed -i "s/your-access-token-secret-here/$JWT_ACCESS_SECRET/" apps/api/.env
        sed -i "s/your-refresh-token-secret-here/$JWT_REFRESH_SECRET/" apps/api/.env
    fi

    echo "✅ Generated secure JWT secrets"
else
    echo "✅ API environment file already exists"
fi

# Create Web .env if it doesn't exist
if [ ! -f "apps/web/.env" ]; then
    echo "📝 Creating Web environment file..."
    echo "VITE_API_URL=http://localhost:3000/api" > apps/web/.env
    echo "✅ Created Web environment file"
else
    echo "✅ Web environment file already exists"
fi

echo ""
if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Starting databases with Docker..."
    docker-compose up -d postgres redis

    echo "⏳ Waiting for databases to be ready..."
    sleep 5

    echo "✅ Databases started"
else
    echo "⚠️  Please ensure PostgreSQL and Redis are running locally"
    echo "   PostgreSQL: localhost:5432"
    echo "   Redis: localhost:6379"
    echo ""
    read -p "Press Enter when databases are ready..."
fi

echo ""
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You're ready to start!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "Then open your browser to:"
echo "  Frontend: http://localhost:5173"
echo "  API: http://localhost:3000"
echo ""
echo "For detailed setup instructions, see:"
echo "  - SETUP.md"
echo "  - README.md"
echo "  - IMPLEMENTATION_SUMMARY.md"
echo ""
echo "Happy coding! 🚀"
