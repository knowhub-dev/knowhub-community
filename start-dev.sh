#!/bin/bash

# KnowHub Community Development Startup Script
echo "🚀 KnowHub Community Development Server"
echo "===================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
echo "📋 Checking requirements..."

if ! command_exists php; then
    echo "❌ PHP is not installed. Please install PHP 8.2+"
    exit 1
fi

if ! command_exists mysql; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

if ! command_exists composer; then
    echo "❌ Composer is not installed. Please install Composer"
    exit 1
fi

echo "✅ All requirements met!"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if frontend .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ frontend/.env.local not found. Creating it..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created frontend/.env.local"
fi

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$LARAVEL_PID" ]; then
        kill $LARAVEL_PID 2>/dev/null
    fi
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
    fi
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Laravel backend
echo ""
echo "🔧 Starting Laravel backend..."
cd "$(dirname "$0")"

# Check if vendor directory exists
if [ ! -d "vendor" ]; then
    echo "📦 Installing Composer dependencies..."
    composer install
fi

# Check if storage link exists
if [ ! -L "public/storage" ]; then
    echo "🔗 Creating storage link..."
    php artisan storage:link
fi

# Start Laravel server in background
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!
echo "✅ Laravel backend started on http://localhost:8000 (PID: $LARAVEL_PID)"

# Wait a moment for Laravel to start
sleep 3

# Start Next.js frontend
echo ""
echo "🎨 Starting Next.js frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Start Next.js development server in background
npm run dev &
NEXTJS_PID=$!
echo "✅ Next.js frontend started on http://localhost:3000 (PID: $NEXTJS_PID)"

echo ""
echo "🎉 KnowHub Community is now running!"
echo "===================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:3000/api-docs"
echo ""
echo "📝 Quick Start:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Register a new account"
echo "3. Go to http://localhost:3000/posts/create to test TinyMCE"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo ""

# Wait for processes
wait
