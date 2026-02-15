# Copilens Setup Script for Windows
# Run this script with: .\setup.ps1

Write-Host "🚀 Copilens Production Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Web Application..." -ForegroundColor Yellow
Set-Location copilens-web
npm install
Write-Host "✅ Web dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing CLI Tool..." -ForegroundColor Yellow
Set-Location ..\copilens_cli
pip install -r requirements.txt
pip install -e .
Write-Host "✅ CLI dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Configuration Setup..." -ForegroundColor Yellow
Set-Location ..\copilens-web

if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Add your Gemini API key to copilens-web\.env" -ForegroundColor Red
    Write-Host "   Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host "   Then edit .env and set: VITE_GEMINI_API_KEY=your_key_here" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Add your Gemini API key to: copilens-web\.env"
Write-Host "   2. Start web app: cd copilens-web; npm run dev"
Write-Host "   3. Test CLI: copilens --help"
Write-Host ""
Write-Host "🌐 Web app will run on: http://localhost:5173" -ForegroundColor Green
Write-Host "💻 CLI is ready to use: copilens <command>" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Web: copilens-web\PRODUCTION_GUIDE.md"
Write-Host "   - CLI: copilens_cli\README.md"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Magenta
