#!/bin/bash

# Copilens Setup Script
# This script sets up the entire Copilens project for production

set -e

echo "🚀 Copilens Production Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python $(python3 --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm --version)"

echo ""
echo "📦 Installing Web Application..."
cd copilens-web
npm install
echo "✅ Web dependencies installed"

echo ""
echo "📦 Installing CLI Tool..."
cd ../copilens_cli
pip3 install -r requirements.txt
pip3 install -e .
echo "✅ CLI dependencies installed"

echo ""
echo "🔧 Configuration Setup..."
cd ../copilens-web

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Add your Gemini API key to copilens-web/.env"
    echo "   Get your key from: https://aistudio.google.com/app/apikey"
    echo "   Then edit .env and set: VITE_GEMINI_API_KEY=your_key_here"
else
    echo "✅ .env file already exists"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Add your Gemini API key to: copilens-web/.env"
echo "   2. Start web app: cd copilens-web && npm run dev"
echo "   3. Test CLI: copilens --help"
echo ""
echo "🌐 Web app will run on: http://localhost:5173"
echo "💻 CLI is ready to use: copilens <command>"
echo ""
echo "📚 Documentation:"
echo "   - Web: copilens-web/PRODUCTION_GUIDE.md"
echo "   - CLI: copilens_cli/README.md"
echo ""
echo "Happy coding! 🎉"
