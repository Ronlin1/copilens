# 🚀 Copilens Quick Start (Windows)

## Install (2 minutes)

```powershell
# 1. Set encoding
$env:PYTHONIOENCODING='utf-8'

# 2. Install
cd copilens_cli
python -m pip install -e .

# 3. Test
python -m copilens.cli --help
```

**Done! ✅**

---

## Try Without API Key (No signup needed)

```powershell
# Detect project architecture
python -m copilens.cli detect-arch

# Analyze repository
python -m copilens.cli stats --full --no-llm

# Prepare for deployment
python -m copilens.cli deploy deploy --platform simple --auto
```

---

## Add AI Features (Free API Key)

```powershell
# 1. Get free key: https://makersuite.google.com/app/apikey

# 2. Set key
$env:GEMINI_API_KEY="your-key-here"

# 3. Try AI features
python -m copilens.cli stats --full --llm
python -m copilens.cli generate generate "hello world in python"
```

---

## Deploy Your Project

```powershell
# 1. Prepare (auto-generates Dockerfile, etc.)
cd your-project
python -m copilens.cli deploy deploy --platform simple --auto

# 2. Build with Docker
docker build -t myapp .

# 3. Run
docker run -p 3000:3000 myapp

# 4. Deploy anywhere
# - Docker Hub → Cloud platforms
# - Render, Fly.io, etc.
```

---

## Test Everything

```powershell
cd copilens_cli
.\test-commands.ps1
```

---

## Get Help

```powershell
# General help
python -m copilens.cli --help

# Command help
python -m copilens.cli stats --help
python -m copilens.cli deploy --help
python -m copilens.cli generate --help

# Read guides
# - WINDOWS_GUIDE.md
# - DEPLOYMENT_GUIDE.md
# - AI_INTEGRATION.md
```

---

## Troubleshooting

**Emoji errors?**
```powershell
$env:PYTHONIOENCODING='utf-8'
```

**`export` not recognized?**
```powershell
# Use PowerShell syntax
$env:VARIABLE="value"
```

**Need API key?**
```
Get free key: https://makersuite.google.com/app/apikey
```

---

**Full guide:** [WINDOWS_GUIDE.md](WINDOWS_GUIDE.md)  
**Support:** atuhaire.com/connect

**That's it! You're ready to use Copilens. 🎉**
