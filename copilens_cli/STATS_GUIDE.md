# Enhanced Stats Command - Full Repository Analysis

## Overview

The enhanced `copilens stats` command now works in **two modes**:

1. **Git Diff Mode** (default) - Analyzes uncommitted changes
2. **Full Repository Mode** (NEW) - Analyzes entire repository without needing git changes

## Why This Matters

**Before:** You needed uncommitted git changes to see stats
```bash
copilens stats
# Output: "No changes detected."
```

**After:** Analyze any repository anytime!
```bash
copilens stats --full --llm
# Output: Complete repository analysis with AI insights
```

---

## Usage

### Mode 1: Git Diff Analysis (Default)

**When to use:** Analyzing specific changes before commit

```bash
# After making code changes
copilens stats

# Or analyze staged changes only
copilens stats --staged
```

**Output:**
- AI percentage per changed file
- Risk scores
- Complexity metrics
- File breakdown

**Requirements:**
- Git repository
- Uncommitted changes

---

### Mode 2: Full Repository Analysis (NEW!)

**When to use:** 
- First time analyzing a codebase
- No uncommitted changes
- Want overall repository insights
- Need AI-powered recommendations

```bash
# Basic full analysis
copilens stats --full

# With AI-powered insights (recommended)
copilens stats --full --llm

# Without LLM (faster, less detailed)
copilens stats --full --no-llm
```

**Output:**
```
📊 Full Repository Analysis

┌────────────────────────────────┐
│   Repository Overview          │
├──────────────────┬─────────────┤
│ Total Files      │ 127         │
│ Total Lines      │ 15,432      │
│ Complexity       │ Medium      │
│ Quality Score    │ 73.5/100    │
└──────────────────┴─────────────┘

┌────────────────────────────────┐
│   Language Breakdown           │
├──────────────┬─────┬───────────┤
│ Python       │ 8,234 │ 53.3%   │
│ TypeScript   │ 4,521 │ 29.3%   │
│ JavaScript   │ 2,677 │ 17.4%   │
└──────────────┴─────┴───────────┘

🤖 Potential AI-Generated Files (12):
  1. src/api/routes.py
  2. src/utils/helpers.py
  3. frontend/components/Button.tsx
  ...

🧠 AI-Powered Insights:
────────────────────────────────────────
This appears to be a full-stack web 
application with a Python backend (FastAPI)
and TypeScript frontend (React).

Code Quality: Generally good with consistent
patterns and documentation. 

Improvements:
• Consider splitting large files (3 files > 500 lines)
• Add more unit tests (estimated coverage: 40%)
• Update dependencies (5 packages outdated)

AI-Generated Code Estimate: ~35%
────────────────────────────────────────
```

**Requirements:**
- Python code files in directory
- API key for LLM insights (optional)

---

## Features Breakdown

### Basic Statistics (Both Modes)

- **Total Files**: Count of code files
- **Total Lines**: Lines of code
- **Languages**: Language breakdown with percentages
- **File Types**: Distribution by extension

### Quality Metrics (Full Mode Only)

**Code Quality Score (0-100):**
- Base: 50 points
- Documentation: +20 points (if 50%+ files have comments/docstrings)
- File sizes: +15 points (if average 50-300 lines)
- Penalties: -20 points for very large files (>500 lines)

**Complexity Estimate:**
- **Low**: Average <50 lines per file
- **Medium**: 50-150 lines per file
- **High**: 150-300 lines per file
- **Very High**: >300 lines per file

### AI Detection (Full Mode Only)

**Heuristics for detecting AI-generated code:**
1. Type hints everywhere (Python)
2. Comprehensive docstrings
3. Consistent indentation
4. Error handling (try/except blocks)
5. Verbose comments

Files scoring 3+ triggers = Flagged as potentially AI-generated

### LLM-Powered Insights (--llm flag)

**What the LLM analyzes:**
- Project architecture type
- Code quality assessment
- Specific improvement recommendations
- AI-generated code percentage estimate

**Provider fallback:**
1. Google Gemini (if GEMINI_API_KEY set)
2. OpenAI GPT (if OPENAI_API_KEY set)
3. Anthropic Claude (if ANTHROPIC_API_KEY set)

---

## Examples

### Example 1: Quick Repository Check

```bash
cd unknown-project
copilens stats --full
```

**Use case:** Quickly understand a new codebase

### Example 2: Deep Analysis with AI

```bash
export GEMINI_API_KEY="your-key"
cd my-project
copilens stats --full --llm
```

**Use case:** Get intelligent recommendations for improvements

### Example 3: Before Deployment

```bash
# Analyze first
copilens stats --full --llm

# Then deploy based on insights
copilens deploy --auto
```

**Use case:** Understand project before deploying

### Example 4: Track Changes

```bash
# Initial baseline
copilens stats --full > baseline.txt

# After making changes
copilens stats --full > current.txt

# Compare
diff baseline.txt current.txt
```

**Use case:** Track project evolution over time

---

## Configuration

### Setting API Keys

**Gemini (Recommended - Free):**
```bash
export GEMINI_API_KEY="your-key"
```

**OpenAI:**
```bash
export OPENAI_API_KEY="your-key"
```

**Anthropic:**
```bash
export ANTHROPIC_API_KEY="your-key"
```

### Skipping LLM Analysis

If you don't want AI insights:
```bash
copilens stats --full --no-llm
```

---

## Output Interpretation

### Quality Score Guide

| Score | Meaning |
|-------|---------|
| 90-100 | Excellent - Well-documented, organized |
| 70-89  | Good - Minor improvements needed |
| 50-69  | Fair - Some technical debt |
| 30-49  | Poor - Refactoring recommended |
| 0-29   | Critical - Major issues |

### Complexity Guide

| Level | Meaning | Action |
|-------|---------|--------|
| Low | Simple codebase | Easy to maintain |
| Medium | Balanced | Monitor growth |
| High | Complex logic | Consider refactoring |
| Very High | Very complex | Urgent refactoring |

### AI Percentage Interpretation

| Range | Meaning |
|-------|---------|
| 0-20% | Mostly human-written |
| 20-40% | Some AI assistance |
| 40-60% | Significant AI contribution |
| 60-80% | Heavily AI-generated |
| 80-100% | Almost entirely AI |

---

## Performance

### Speed Comparison

**Small projects (<50 files):**
- Without LLM: ~1-2 seconds
- With LLM: ~3-5 seconds

**Medium projects (50-200 files):**
- Without LLM: ~3-5 seconds
- With LLM: ~6-10 seconds

**Large projects (200+ files):**
- Without LLM: ~5-10 seconds
- With LLM: ~10-15 seconds

### Tips for Large Projects

```bash
# Skip LLM for faster analysis
copilens stats --full --no-llm

# Or analyze specific directory
cd src/
copilens stats --full --llm
```

---

## Troubleshooting

### "No LLM provider available"

**Cause:** No API key set

**Solution:**
```bash
export GEMINI_API_KEY="your-key"
```

Or skip LLM:
```bash
copilens stats --full --no-llm
```

### Slow performance

**Cause:** Large repository with many files

**Solutions:**
1. Use `--no-llm` flag
2. Analyze subdirectories separately
3. Exclude large directories first

### Inaccurate AI detection

**Cause:** Heuristics are probabilistic

**Solution:** Use as a guide, not absolute truth. Combine with:
- `copilens detect-arch` for architecture
- `copilens deploy --auto` for deployment readiness
- Manual review of flagged files

---

## Best Practices

### 1. Regular Analysis

```bash
# Weekly codebase health check
copilens stats --full --llm > weekly-report-$(date +%Y-%m-%d).txt
```

### 2. Pre-Deployment

```bash
# Before deploying
copilens stats --full --llm
copilens detect-arch
copilens deploy --prepare
```

### 3. Team Onboarding

```bash
# New team member joins
copilens stats --full --llm
# Share output to help them understand the codebase
```

### 4. Continuous Monitoring

```bash
# In CI/CD pipeline
copilens stats --full --no-llm --path /project
```

---

## Comparison with Other Tools

### vs `copilens detect-arch`

| Feature | `stats --full` | `detect-arch` |
|---------|---------------|---------------|
| Purpose | Code analysis | Architecture detection |
| Output | Stats + insights | Architecture details |
| LLM | Optional | No |
| Speed | Medium | Fast |
| Use when | General health | Before deployment |

### vs Traditional `copilens stats`

| Feature | `stats --full` | `stats` (default) |
|---------|---------------|-------------------|
| Git required | No | Yes |
| Scope | Entire repo | Changed files only |
| LLM insights | Yes (optional) | No |
| Use when | Anytime | Before commit |

---

## Integration with Other Commands

### Workflow Example

```bash
# 1. Analyze repository
copilens stats --full --llm

# 2. Generate missing code
copilens generate "Add unit tests" --language python

# 3. Detect architecture
copilens detect-arch

# 4. Deploy
copilens deploy --auto

# 5. Monitor
copilens monitor start <deployed-url>
```

---

## API Reference

```bash
copilens stats [OPTIONS]

Options:
  --path TEXT         Repository path (default: current directory)
  --staged, -s        Analyze staged changes only (git mode)
  --full, -f          Full repository analysis (no git needed)
  --llm/--no-llm      Enable/disable LLM insights (default: enabled)
  --help              Show this message
```

---

## Support

Questions? Check:
- **README.md** - Overview
- **AI_INTEGRATION.md** - LLM setup
- **DEPLOYMENT_GUIDE.md** - Deployment info
- **Contact:** atuhaire.com/connect
