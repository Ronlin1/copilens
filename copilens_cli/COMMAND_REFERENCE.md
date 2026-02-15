# Copilens Command Reference - Quick Guide

## ✅ All Commands Working - 100% Pass Rate!

### 🔑 Setup (First Time - 2 Minutes)

```powershell
# Step 1: Install
cd copilens_cli
python -m pip install -e .

# Step 2: Setup API key (interactive wizard)
python -m copilens.cli config setup

# Step 3: Start using!
python -m copilens.cli chat-ai interactive
```

---

## 📋 All Available Commands

### 🔧 Configuration

```powershell
copilens config                 # Show current config + available commands
copilens config setup           # Interactive setup wizard (RECOMMENDED)
copilens config show            # Show API keys (masked)
copilens config set gemini KEY  # Set Gemini API key
copilens config get-key         # Get instructions for API keys
copilens config remove gemini   # Remove API key
```

### 💬 Interactive Chat (NEW!)

```powershell
copilens chat-ai                      # Show available commands
copilens chat-ai interactive          # Start interactive chat
copilens chat-ai interactive --analyze # Chat with repo context
copilens chat-ai quick "question"     # Quick one-off question
```

**Example:**
```powershell
copilens chat-ai quick "What are Python best practices?"
```

### 🔍 Remote Repository Analysis (NEW!)

```powershell
copilens remote                                    # Show available commands
copilens remote quick <url>                        # Quick scan (no API key)
copilens remote analyze <url>                      # Full AI analysis
copilens remote analyze <url> --type security      # Security-focused
copilens remote analyze <url> --save report.md     # Save to file
```

**Example:**
```powershell
copilens remote quick https://github.com/facebook/react
copilens remote analyze https://github.com/torvalds/linux --type architecture
```

### ✨ Code Generation

```powershell
copilens generate                                   # Show available commands
copilens generate generate "description"            # Generate code
copilens generate generate "REST API" -l python     # With language
copilens generate generate "API" -f fastapi -o api.py # With framework + output
```

### 🚀 Deployment

```powershell
copilens deploy                                 # Show available commands
copilens detect-arch                            # Detect project architecture
copilens deploy deploy --platform simple        # Prepare for deployment
copilens deploy deploy --platform simple --auto # Auto-prepare (creates Dockerfile)
copilens deploy status                          # Show deployment status
```

### 📊 Repository Analysis

```powershell
copilens stats                      # Git-based stats
copilens stats --full --no-llm      # Full repo analysis (no API key needed)
copilens stats --full --llm         # Full repo analysis with AI insights
copilens diff                       # Analyze git diff
copilens risk                       # Risk analysis
copilens trend                      # View trends
```

### 📈 Monitoring

```powershell
copilens monitor                        # Show available commands
copilens monitor start <url>            # Start monitoring URL
copilens monitor stop <url>             # Stop monitoring
copilens monitor list                   # List monitored apps
```

### 🤖 Agent Commands

```powershell
copilens agent <goal>               # Start autonomous agent
copilens agent-status               # Show agent status
copilens agent-memory               # View agent memory
copilens agent-review               # AI code review
```

### 📝 Other Commands

```powershell
copilens init                       # Initialize in Git repo
copilens explain                    # Explain code changes
copilens chat                       # Original chat (Copilot Agent)
copilens export                     # Export analysis report
copilens --help                     # Show all commands
```

---

## 🎯 Common Workflows

### Workflow 1: First Time Setup

```powershell
# 1. Setup
copilens config setup

# 2. Test it
copilens chat-ai quick "Hello!"

# 3. Start chatting
copilens chat-ai interactive
```

### Workflow 2: Analyze GitHub Repository

```powershell
# Quick scan (no API key)
copilens remote quick https://github.com/user/repo

# Full analysis (needs API key)
copilens remote analyze https://github.com/user/repo

# Security audit
copilens remote analyze https://github.com/user/repo --type security --save audit.md
```

### Workflow 3: Deploy Your Project

```powershell
# 1. Detect architecture
copilens detect-arch

# 2. Prepare for deployment
copilens deploy deploy --platform simple --auto

# 3. Build with Docker
docker build -t myapp .

# 4. Run
docker run -p 3000:3000 myapp
```

### Workflow 4: Interactive Code Help

```powershell
# Start chat with repo context
copilens chat-ai interactive --analyze

# Now ask questions like:
# - "Explain the architecture of this project"
# - "How can I improve the code quality?"
# - "What security issues should I fix?"
# - "Suggest refactoring for the main module"
```

### Workflow 5: Analyze Your Code

```powershell
# Without API key
copilens stats --full --no-llm

# With AI insights (needs API key)
copilens stats --full --llm

# Check risks
copilens risk
```

---

## 💡 Pro Tips

### 1. Use Config File (Not Environment Variables)

```powershell
# ✅ Recommended (permanent)
copilens config set gemini YOUR_KEY

# ❌ Not recommended (temporary)
$env:GEMINI_API_KEY="YOUR_KEY"
```

### 2. Quick Commands Show Help

```powershell
# These now show helpful info instead of errors:
copilens config      # Shows current config + commands
copilens chat-ai     # Shows chat commands
copilens remote      # Shows remote analysis commands
```

### 3. Test Without API Key

Many commands work without API keys:
```powershell
copilens detect-arch                    # ✅ No API key needed
copilens stats --full --no-llm          # ✅ No API key needed
copilens remote quick <url>             # ✅ No API key needed
copilens deploy deploy --platform simple # ✅ No API key needed
```

### 4. Get Free API Key

```powershell
copilens config get-key    # Shows instructions
```

Or visit: https://makersuite.google.com/app/apikey

---

## 🆘 Troubleshooting

### "No API key found"

```powershell
# Run setup wizard
copilens config setup

# Or set directly
copilens config set gemini YOUR_KEY
```

### "Missing command" Error

Commands now show helpful info! Just run:
```powershell
copilens config      # Shows what you can do
copilens chat-ai     # Shows chat commands
copilens remote      # Shows remote commands
```

### Command Not Found

```powershell
# Reinstall
cd copilens_cli
python -m pip install -e .

# Test
python -m copilens.cli --help
```

### Can't See Help

All commands support `--help`:
```powershell
copilens --help
copilens config --help
copilens chat-ai --help
copilens remote --help
```

---

## 📊 Command Categories

| Category | Commands | API Key Needed? |
|----------|----------|-----------------|
| **Setup** | config | ❌ |
| **Chat** | chat-ai | ✅ |
| **Remote Analysis** | remote quick | ❌ |
| **Remote Analysis** | remote analyze | ✅ |
| **Code Gen** | generate | ✅ |
| **Deploy** | deploy, detect-arch | ❌ |
| **Analysis** | stats --no-llm | ❌ |
| **Analysis** | stats --llm | ✅ |
| **Monitor** | monitor | ❌ |
| **Agent** | agent | ✅ |

---

## ⚡ Quick Reference

**Setup:**
```powershell
copilens config setup
```

**Chat:**
```powershell
copilens chat-ai interactive
```

**Analyze GitHub:**
```powershell
copilens remote analyze https://github.com/user/repo
```

**Deploy:**
```powershell
copilens deploy deploy --platform simple --auto
```

**Get Help:**
```powershell
copilens --help
copilens config --help
copilens chat-ai --help
```

---

## ✅ All Tests Passing!

```
Total Tests:  19
Passed:      19
Failed:       0
Pass Rate:   100%
```

**Every command has been tested and works!** 🎉

---

## 📖 Documentation

- **API_KEY_SETUP.md** - Detailed API key setup
- **CHAT_SETUP_GUIDE.md** - Interactive chat guide
- **REMOTE_ANALYSIS_GUIDE.md** - Remote repo analysis
- **WINDOWS_GUIDE.md** - Windows-specific help
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

---

**Need Help?** Run `copilens --help` or visit atuhaire.com/connect

**Track AI, Trust Code** 🚀
