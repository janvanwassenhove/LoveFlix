#!/bin/bash
# LoveFlix Desktop App - macOS/Linux Startup Script
# ==================================================

echo ""
echo "  💕 LoveFlix - Transform Any Movie Into Romance! 💕"
echo "  =================================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "  ❌ Node.js is not installed!"
    echo "  Please install Node.js from https://nodejs.org/"
    echo "  Or use: brew install node (macOS with Homebrew)"
    echo ""
    exit 1
fi

# Navigate to electron-app directory
cd "$SCRIPT_DIR/electron-app"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  📦 Installing dependencies..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "  ❌ Failed to install dependencies!"
        exit 1
    fi
    echo ""
fi

echo "  🚀 Starting LoveFlix..."
echo ""

# Start the app
npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "  ❌ Failed to start LoveFlix!"
    exit 1
fi
