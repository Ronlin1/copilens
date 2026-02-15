# Windows Setup Guide for Copilens

## Setting API Keys on Windows

### PowerShell (Recommended)
```powershell
# Temporary (current session only)
$env:GEMINI_API_KEY="your-api-key-here"

# Verify it's set
$env:GEMINI_API_KEY

# Permanent (for current user)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-api-key-here', 'User')

# Then restart PowerShell
```

### Command Prompt (cmd)
```cmd
# Temporary (current session only)
set GEMINI_API_KEY=your-api-key-here

# Verify it's set
echo %GEMINI_API_KEY%

# Permanent (system-wide)
setx GEMINI_API_KEY "your-api-key-here"

# Then restart Command Prompt
```

### Using .env File (Easiest!)
```powershell
# Create .env file in your project
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Copilens will automatically load it
```

## Quick Setup Script

Run this in PowerShell:

```powershell
# Install Copilens
cd copilens_cli
pip install -e .
pip install pyyaml toml requests python-dotenv

# Set API key (replace with your actual key)
$env:GEMINI_API_KEY="your-gemini-api-key"

# Test it
python -c "import os; print('API Key set!' if os.getenv('GEMINI_API_KEY') else 'API Key NOT set')"

# Try Copilens
copilens stats --full --llm
```

## Get Free Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Run: `$env:GEMINI_API_KEY="paste-key-here"`

## Common Issues

### "export: command not found"
**Problem:** `export` is for Linux/Mac, not Windows

**Solution:** Use `$env:` in PowerShell or `set` in cmd
```powershell
# ❌ DON'T USE (Linux/Mac only)
export GEMINI_API_KEY="key"

# ✅ USE THIS (Windows PowerShell)
$env:GEMINI_API_KEY="key"

# ✅ OR THIS (Windows cmd)
set GEMINI_API_KEY=key
```

### API key not persisting
**Problem:** Set in one terminal, gone in another

**Solution:** Use permanent method
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-key', 'User')
```

### Railway CLI not found
**Problem:** Railway CLI not installed

**Solution:** We've added alternative deployment! See below.

## Alternative Deployment (No Railway CLI Required!)

Copilens now includes simple HTTP-based deployment that doesn't need CLI tools.

```powershell
# Deploy without Railway CLI
copilens deploy --platform simple

# Or use Docker-based deployment
copilens deploy --platform docker
```

## Full Windows Setup

```powershell
# 1. Navigate to copilens
cd C:\Users\YourName\Downloads\Afro\copilens\copilens_cli

# 2. Install
pip install -e .
pip install pyyaml toml requests python-dotenv

# 3. Set API key permanently
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-key-here', 'User')

# 4. Restart PowerShell, then test
copilens stats --full --llm

# 5. Try other commands
copilens detect-arch
copilens generate "hello world function"
```

## Verification Script

Run this to check everything:

```powershell
# Save as check-setup.ps1
Write-Host "Checking Copilens Setup..." -ForegroundColor Cyan

# Check Python
Write-Host "`n1. Python:" -ForegroundColor Yellow
python --version

# Check Copilens installed
Write-Host "`n2. Copilens:" -ForegroundColor Yellow
pip show copilens

# Check dependencies
Write-Host "`n3. Dependencies:" -ForegroundColor Yellow
pip show pyyaml toml requests

# Check API key
Write-Host "`n4. API Key:" -ForegroundColor Yellow
if ($env:GEMINI_API_KEY) {
    Write-Host "✓ GEMINI_API_KEY is set" -ForegroundColor Green
} else {
    Write-Host "✗ GEMINI_API_KEY is NOT set" -ForegroundColor Red
    Write-Host "Set it with: `$env:GEMINI_API_KEY='your-key'" -ForegroundColor Yellow
}

# Test Copilens
Write-Host "`n5. Testing Copilens:" -ForegroundColor Yellow
python -c "from copilens.analyzers.repo_analyzer import RepositoryAnalyzer; print('✓ Copilens imports work')"

Write-Host "`nSetup check complete!" -ForegroundColor Cyan
```

## Troubleshooting

### "ModuleNotFoundError"
```powershell
pip install -e .
pip install pyyaml toml requests python-dotenv
```

### "No LLM provider available"
```powershell
# Check if key is set
$env:GEMINI_API_KEY

# If empty, set it
$env:GEMINI_API_KEY="your-key-here"
```

### Commands not working
```powershell
# Make sure you're in the right directory
cd copilens_cli

# Reinstall
pip install -e . --force-reinstall
```

## Quick Reference

| Task | Windows PowerShell |
|------|-------------------|
| Set API key (temp) | `$env:GEMINI_API_KEY="key"` |
| Set API key (permanent) | `[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'key', 'User')` |
| Check API key | `$env:GEMINI_API_KEY` |
| Install | `pip install -e .` |
| Test | `copilens stats --full --llm` |
