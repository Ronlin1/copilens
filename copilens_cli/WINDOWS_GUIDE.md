# Windows Usage Guide for Copilens

## Quick Setup

### 1. Set UTF-8 Encoding (Required for emojis)

**PowerShell:**
```powershell
# Current session
$env:PYTHONIOENCODING='utf-8'

# Permanent (add to PowerShell profile)
notepad $PROFILE
# Add this line: $env:PYTHONIOENCODING='utf-8'
```

**Command Prompt:**
```cmd
chcp 65001
```

### 2. Install Copilens

```powershell
cd copilens_cli
python -m pip install -e .
```

### 3. Set API Key (Optional - for AI features)

**PowerShell - Current Session:**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

**PowerShell - Permanent:**
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-key', 'User')
```

**Get Free API Key:**
https://makersuite.google.com/app/apikey

---

## Command Reference

### Commands That Work WITHOUT API Key ✅

```powershell
# Welcome screen
python -m copilens.cli

# Architecture detection
python -m copilens.cli detect-arch

# Repository analysis (without AI insights)
python -m copilens.cli stats --full --no-llm

# Prepare for deployment (generates Docker files)
python -m copilens.cli deploy deploy --platform simple --auto

# Check deployment status
python -m copilens.cli deploy status

# Initialize copilens in a git repo
python -m copilens.cli init

# View code diff analysis
python -m copilens.cli diff

# View risk analysis
python -m copilens.cli risk
```

### Commands That NEED API Key 🔑

```powershell
# AI-powered repository insights
python -m copilens.cli stats --full --llm

# Generate code from description
python -m copilens.cli generate generate "hello world in python"

# Code generation with options
python -m copilens.cli generate generate "REST API" --language python --framework fastapi

# AI-powered code explanations
python -m copilens.cli explain

# Interactive chat
python -m copilens.cli chat

# AI code review
python -m copilens.cli agent-review
```

### Deployment Commands

#### Simple Deployment (No Railway CLI needed)
```powershell
# Generates Dockerfile, .dockerignore, README.md
python -m copilens.cli deploy deploy --platform simple --auto

# Then use Docker:
docker build -t myapp .
docker run -p 3000:3000 myapp
```

#### Railway Deployment (Requires Railway CLI)
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
python -m copilens.cli deploy deploy --platform railway --auto
```

---

## Common Issues & Solutions

### Issue 1: "export" command not recognized ❌

**Solution:** Use Windows-specific commands

```powershell
# ❌ Wrong (Linux/Mac):
export GEMINI_API_KEY="key"

# ✅ Right (PowerShell):
$env:GEMINI_API_KEY="key"

# ✅ Right (Command Prompt):
set GEMINI_API_KEY=key
```

### Issue 2: Unicode encoding errors ❌

**Solution:** Set UTF-8 encoding

```powershell
$env:PYTHONIOENCODING='utf-8'
```

### Issue 3: "pip" not found or launcher error ❌

**Solution:** Use Python module invocation

```powershell
python -m pip install package-name
```

### Issue 4: API key not working ❌

**Solution:** Check if it's set

```powershell
# Check if set
echo $env:GEMINI_API_KEY

# Set it
$env:GEMINI_API_KEY="your-key-here"

# Verify
python -c "import os; print(os.getenv('GEMINI_API_KEY'))"
```

### Issue 5: Railway CLI not installed ❌

**Solution:** Use simple deployer or install Railway CLI

```powershell
# Option 1: Use simple deployer (no CLI needed)
python -m copilens.cli deploy deploy --platform simple --auto

# Option 2: Install Railway CLI
npm install -g @railway/cli
```

---

## Testing Your Installation

Run this PowerShell script:

```powershell
$env:PYTHONIOENCODING='utf-8'

Write-Host "Testing Copilens..." -ForegroundColor Cyan

# Test 1: Basic command
Write-Host "`n1. Testing basic commands..." -ForegroundColor Yellow
python -m copilens.cli --help

# Test 2: Architecture detection
Write-Host "`n2. Testing architecture detection..." -ForegroundColor Yellow
python -m copilens.cli detect-arch

# Test 3: Deployment prep
Write-Host "`n3. Testing deployment..." -ForegroundColor Yellow
python -m copilens.cli deploy deploy --platform simple --auto

Write-Host "`n✓ Tests complete!" -ForegroundColor Green
```

---

## Full Workflow Example

```powershell
# 1. Set encoding
$env:PYTHONIOENCODING='utf-8'

# 2. Navigate to your project
cd path\to\your\project

# 3. Detect architecture (no API key needed)
python -m copilens.cli detect-arch

# 4. Analyze code (no API key needed)
python -m copilens.cli stats --full --no-llm

# 5. Prepare for deployment (no API key needed)
python -m copilens.cli deploy deploy --platform simple --auto

# 6. Build and run with Docker
docker build -t myapp .
docker run -p 3000:3000 myapp

# 7. (Optional) Get AI insights
$env:GEMINI_API_KEY="your-key"
python -m copilens.cli stats --full --llm
```

---

## Feature Matrix

| Feature | Requires API Key | Requires Railway CLI | Works Offline |
|---------|-----------------|---------------------|---------------|
| Architecture Detection | ❌ | ❌ | ✅ |
| Stats (no-llm) | ❌ | ❌ | ✅ |
| Stats (with AI) | ✅ | ❌ | ❌ |
| Code Generation | ✅ | ❌ | ❌ |
| Simple Deploy | ❌ | ❌ | ✅ |
| Railway Deploy | ❌ | ✅ | ❌ |
| Git Analysis | ❌ | ❌ | ✅ |
| Risk Analysis | ❌ | ❌ | ✅ |
| Agent Mode | ✅ | ❌ | ❌ |

---

## Recommended Workflow for Windows Users

1. **Start without API key** - Test all analysis features
2. **Get free Gemini API key** - Unlock AI features  
3. **Use simple deployment** - No Railway CLI needed
4. **Deploy with Docker** - Works everywhere

---

## PowerShell Profile Setup (One-Time)

Add these to your PowerShell profile for permanent settings:

```powershell
# Open profile
notepad $PROFILE

# Add these lines:
$env:PYTHONIOENCODING='utf-8'
$env:GEMINI_API_KEY='your-key-here'  # Optional

# Save and reload
. $PROFILE
```

---

## Alternative: Use .env File

Create a `.env` file in your project:

```
PYTHONIOENCODING=utf-8
GEMINI_API_KEY=your-key-here
```

Then use python-dotenv:

```powershell
python -m pip install python-dotenv
```

---

## Getting Help

```powershell
# General help
python -m copilens.cli --help

# Command-specific help
python -m copilens.cli generate --help
python -m copilens.cli deploy --help
python -m copilens.cli stats --help

# Check version
python -m copilens.cli --version
```

---

## Support

- Documentation: See README.md, DEPLOYMENT_GUIDE.md
- Issues: Report bugs or request features
- Contact: atuhaire.com/connect
