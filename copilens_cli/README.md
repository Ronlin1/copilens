# Copilens CLI

**Track AI, Trust Code** - Full-Stack Autonomous Agent for AI Analysis, Code Generation, Deployment & Monitoring

> **Windows Users**: See [WINDOWS_GUIDE.md](WINDOWS_GUIDE.md) for Windows-specific setup and troubleshooting

## Overview

Copilens is a comprehensive terminal intelligence platform that:
- 🤖 **Tracks & Analyzes** AI-generated code in Git repositories
- ✨ **Generates Code** from natural language using LLMs (Gemini/GPT/Claude)
- 🚀 **Auto-Deploys** projects to cloud platforms (Vercel, Railway, Netlify, etc.)
- 📊 **Monitors** deployed applications 24/7 with real-time alerts
- 🧠 **Operates Autonomously** with full agentic capabilities

## ✨ Features

### 🔍 AI Analysis & Intelligence
- AI contribution tracking with confidence scores
- Code complexity analysis (Radon-based)
- Multi-factor risk scoring
- AI fingerprint detection (7-pattern heuristic)
- Interactive explanations
- Trend tracking over time
- Exportable reports (JSON/CSV)

### 🤖 Code Generation (NEW)
- Generate code from natural language descriptions
- Multi-language support (Python, TypeScript, JavaScript, Go, etc.)
- Framework-aware generation (React, FastAPI, Next.js, etc.)
- Interactive refinement mode
- LLM-powered (Gemini 2.0, GPT-4, Claude 3.5)

### 🚀 Deployment Engine (NEW)
- Auto-detect project architecture (React, Node.js, Python, etc.)
- Generate missing configs (Dockerfile, .dockerignore, .env.example)
- Deploy to multiple platforms:
  - Railway (Node.js, Python, Go)
  - Vercel (Next.js, React)
  - Netlify (Static sites)
  - Render, Cloud Run (coming soon)
- One-command deployment: `copilens deploy --auto`

### 📊 Live Monitoring (NEW)
- 24/7 uptime monitoring
- Response time tracking
- Anomaly detection
- Multi-channel alerts (Slack, Discord, Email, Webhook)
- Real-time dashboards

### 🧠 Autonomous Agent
- Full ReAct pattern implementation (Observe → Think → Plan → Act → Learn)
- Persistent memory system
- Self-learning from successes/failures
- 10+ registered tools
- Goal-oriented execution

## Installation

```bash
# Clone or navigate to the copilens_cli directory
cd copilens_cli

# Install in development mode
pip install -e .

# Set API key for code generation (optional but recommended)
export GEMINI_API_KEY="your-api-key-here"  # Free tier available!
```

## Quick Start

### 1. AI Analysis (Works Without Git Changes!)
```bash
# Analyze any repository - no git changes needed!
cd any-project
copilens stats --full --llm

# What you get:
# 📊 Total files, lines, languages
# 🎯 Code quality score
# 🤖 Potential AI-generated files
# 🧠 AI-powered insights and recommendations

# Traditional git diff analysis
cd your-git-repo
copilens init        # Initialize Copilens
copilens stats       # View AI contribution stats (requires changes)
copilens risk        # Check risk scores
```

### 2. Code Generation
```bash
# Generate code from description
copilens generate "REST API for user management" --language python

# Generate with framework
copilens generate "React login component" --framework react --output Login.tsx

# Interactive mode
copilens generate "data visualization dashboard" --interactive
```

### 3. Deployment
```bash
# Fully autonomous deployment
cd your-project
copilens deploy --auto

# Specific platform
copilens deploy --platform railway

# Detect project architecture
copilens detect-arch
```

### 4. Monitoring
```bash
# Start monitoring deployed app
copilens monitor start https://your-app.railway.app

# Check current status
copilens monitor status https://your-app.railway.app

# Configure alerts
copilens monitor configure-alerts --slack https://hooks.slack.com/...
```

### 5. Autonomous Agent
```bash
# Full autonomous deployment pipeline
copilens agent deploy-app --auto

# Autonomous code generation
copilens agent generate-feature "payment system" --auto

# View agent status
copilens agent-status

# View agent memory
copilens agent-memory
```

## Usage

### AI Analysis Commands

```bash
# Initialize Copilens in your Git repository
copilens init

# View AI contribution statistics (git changes)
copilens stats

# NEW: Full repository analysis (no git changes needed!)
copilens stats --full --llm

# Analyze diff for AI patterns
copilens diff

# Check risk score
copilens risk

# Explain AI changes
copilens explain

# Interactive chat mode (Copilot-powered)
copilens chat

# Multi-agent code review
copilens agent-review

# View trends over time
copilens trend

# Export report
copilens export
```

### Code Generation Commands (NEW)

```bash
# Generate from description
copilens generate "Python function to parse CSV files"

# With language and framework
copilens generate "GraphQL API" --language typescript --framework nestjs

# Save to file
copilens generate "React button component" --output Button.tsx

# Interactive refinement
copilens generate "data processor" --interactive
```

### Deployment Commands (NEW)

```bash
# Auto-deploy (detects best platform)
copilens deploy --auto

# Deploy to specific platform
copilens deploy --platform railway

# Prepare only (generate configs, don't deploy)
copilens deploy --prepare

# Detect project architecture
copilens detect-arch

# View deployment status
copilens deploy-status
```

### Monitoring Commands (NEW)

```bash
# Start monitoring
copilens monitor start https://myapp.com --interval 60

# Check status once
copilens monitor status https://myapp.com

# Configure Slack alerts
copilens monitor configure-alerts --slack <webhook-url>

# Configure Discord alerts
copilens monitor configure-alerts --discord <webhook-url>
```

### Autonomous Agent Commands

```bash
# Reduce repository risk autonomously
copilens agent reduce-risk --auto

# Improve code quality autonomously
copilens agent improve-quality --auto

# Full autonomous deployment
copilens agent deploy-app --auto

# Generate feature autonomously
copilens agent generate-feature "user authentication" --auto

# Check agent status
copilens agent-status

# View agent memory and learning
copilens agent-memory

# Clear agent memory
copilens agent-memory --clear
```

## Configuration

### API Keys for Code Generation

```bash
# Google Gemini (Recommended - Free tier available)
export GEMINI_API_KEY="your-key-here"

# OpenAI (Optional)
export OPENAI_API_KEY="your-key-here"

# Anthropic Claude (Optional)
export ANTHROPIC_API_KEY="your-key-here"
```

Get your free Gemini API key: https://makersuite.google.com/app/apikey

### Deployment Platform Setup

**Railway:**
```bash
npm install -g @railway/cli
railway login
```

**Vercel (coming soon):**
```bash
npm install -g vercel
vercel login
```

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[USAGE.md](USAGE.md)** - Detailed usage instructions
- **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - LLM setup and configuration
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment documentation
- **[AGENTIC_MODE.md](AGENTIC_MODE.md)** - Autonomous agent guide
- **[AI_DETECTION_ALGORITHM.md](AI_DETECTION_ALGORITHM.md)** - Detection methodology
- **[TESTING_VALIDATION.md](TESTING_VALIDATION.md)** - Testing and validation
- **[COPILOT_AGENT_MODE.md](COPILOT_AGENT_MODE.md)** - GitHub Copilot integration
- **[ADVANCED_FEATURES_ROADMAP.md](ADVANCED_FEATURES_ROADMAP.md)** - Future features

## Architecture

```
copilens_cli/
├── src/copilens/
│   ├── commands/          # CLI commands
│   │   ├── init.py
│   │   ├── stats.py
│   │   ├── generate.py    # NEW: Code generation
│   │   ├── deploy.py      # NEW: Deployment
│   │   ├── monitor.py     # NEW: Monitoring
│   │   └── agent.py       # Autonomous agent
│   ├── core/              # Core functionality
│   │   ├── git_analyzer.py
│   │   ├── ai_detector.py
│   │   └── copilot_agent.py
│   ├── analyzers/         # Code analyzers
│   │   ├── complexity.py
│   │   ├── risk.py
│   │   ├── architecture_detector.py  # NEW
│   │   └── config_detector.py        # NEW
│   ├── agentic/           # Autonomous agent
│   │   ├── core.py        # Agent implementation
│   │   ├── tools.py       # Agent tools
│   │   └── llm_provider.py  # NEW: LLM integration
│   ├── deployment/        # NEW: Deployment engine
│   │   ├── manager.py
│   │   ├── base.py
│   │   └── platforms/
│   ├── monitoring/        # NEW: Monitoring system
│   │   ├── health_checker.py
│   │   └── alerts.py
│   └── ui/                # Terminal UI
└── tests/                 # Test suite
```

## Tech Stack

### Core
- **CLI**: Typer
- **UI**: Rich, Textual
- **Git**: GitPython
- **Analysis**: Radon, AST

### NEW: AI & LLM
- **Google Gemini**: 2.0 Flash (primary)
- **OpenAI**: GPT-4o Mini (fallback)
- **Anthropic**: Claude 3.5 (fallback)

### NEW: Deployment
- **Platforms**: Railway, Vercel, Netlify, Render, Cloud Run
- **Containerization**: Docker

### NEW: Monitoring
- **HTTP**: Requests
- **Alerts**: Slack SDK, Discord Webhook

### Data & Validation
- **Data**: Pandas, NumPy
- **Validation**: Pydantic v2
- **Testing**: Pytest

## Requirements

- Python 3.8+
- Git repository
- **NEW**: LLM API key (Gemini recommended - free tier available)
- **NEW**: Platform CLI for deployment (Railway, Vercel, etc.)

## Examples

### Full Autonomous Workflow

```bash
# 1. Generate a new feature
export GEMINI_API_KEY="your-key"
copilens generate "FastAPI CRUD API for tasks" --output api.py

# 2. Deploy it
copilens deploy --auto
# Output: 🌐 https://my-api.railway.app

# 3. Monitor it
copilens monitor start https://my-api.railway.app --interval 30

# 4. Configure alerts
copilens monitor configure-alerts --slack https://hooks.slack.com/...
```

### Agent-Driven Development

```bash
# Let the agent handle everything
copilens agent deploy-app --auto

# What the agent does:
# 1. Analyzes codebase
# 2. Detects architecture
# 3. Generates missing configs
# 4. Selects best platform
# 5. Deploys application
# 6. Starts monitoring
# 7. Learns from results
```

## Coming Soon

- [ ] Vercel, Netlify, Render deployers
- [ ] CI/CD integration templates
- [ ] VS Code extension
- [ ] Team analytics dashboard
- [ ] Policy engine for enterprise
- [ ] Local LLM support (Ollama)
- [ ] Multi-repo analysis

## Support & Contact

- **Documentation**: See docs/ folder
- **Issues**: GitHub Issues
- **Contact**: **atuhaire.com/connect**

## License

MIT
