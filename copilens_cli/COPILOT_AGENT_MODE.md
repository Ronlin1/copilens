# GitHub Copilot Agent Mode Integration Guide

## 🤖 Full Copilot Agent Mode Integration

Copilens now includes **full GitHub Copilot Agent Mode integration** for AI-powered code analysis and review!

## Features

### 1. **Agent-Powered Chat Mode**
Interactive chat with GitHub Copilot's AI agent for intelligent code analysis.

```bash
copilens chat
```

**Capabilities:**
- Context-aware conversations about your code
- Intelligent explanations of AI patterns
- Security and quality recommendations
- Natural language code review

**Special Commands:**
- `explain <file>` - Deep dive into specific file
- `analyze` - Comprehensive multi-agent analysis
- `review <file>` - Interactive code review
- `help` - Show all commands

### 2. **Agent Review Command** (NEW)
AI-powered code review using multiple specialized agents.

```bash
# Review single file
copilens agent-review myfile.py

# Full multi-agent analysis
copilens agent-review --full

# Review all changes
copilens agent-review
```

**Multi-Agent Analysis:**
- 🔒 **Security Agent**: Scans for vulnerabilities
- 📊 **Quality Agent**: Identifies code smells
- ♻️  **Refactoring Agent**: Suggests improvements
- 🎯 **Priority Agent**: Flags high-risk files

### 3. **Intelligent Code Explanations**
Copilot-powered explanations that understand context and provide actionable insights.

### 4. **Automated Suggestions**
Get AI-generated improvement suggestions based on:
- AI contribution percentage
- Risk level
- Security concerns
- Code quality metrics

## Setup

### Prerequisites

1. **GitHub CLI** (required)
   ```bash
   # Install GitHub CLI
   winget install GitHub.cli
   ```

2. **GitHub Copilot Extension** (required for agent mode)
   ```bash
   gh extension install github/gh-copilot
   ```

3. **GitHub Copilot Subscription** (required)
   - Individual or Business subscription
   - Active authentication with `gh auth login`

### Verify Installation

```bash
# Check GitHub CLI
gh --version

# Check Copilot extension
gh copilot --version

# Test Copilot
gh copilot explain "what is a git repository"
```

## Usage Examples

### Example 1: Interactive Chat with Context

```bash
$ copilens chat

✓ GitHub Copilot Agent Mode Enabled

You're chatting with an AI-powered agent...

You: How is the AI detection algorithm working?

Copilens Agent:
The AI detection algorithm uses 7 heuristic patterns to identify
AI-generated code. It analyzes patterns like:
- Large code insertions (50+ lines)
- Verbose documentation
- Extensive type hints
...

You: explain auth.py

Analyzing auth.py...
AI Percentage: 78%
Confidence: HIGH

Copilot Explanation:
This authentication module shows strong AI-generation indicators...
```

### Example 2: Multi-Agent Code Review

```bash
$ copilens agent-review --full

Running multi-agent analysis...

📊 Multi-Agent Analysis Results
══════════════════════════════
Overall Assessment: ⚠️  HIGH RISK: 3/7 files need careful review

Files Analyzed: 7
High Priority: 3
Security Findings: 2
Code Smells: 5
Refactoring Opportunities: 8

🚨 High Priority Files:
  • auth.py (89% AI)
  • payment.py (76% AI)
  • config.py (72% AI)

🔒 Security Findings:
  ⚠️  Password handling detected in auth.py - ensure proper hashing
  ⚠️  API key detected in config.py - verify secure storage

♻️  Refactoring Opportunities:
  💡 auth.py: Very large file (consider splitting)
  💡 payment.py: Many functions (consider refactoring)
  ...
```

### Example 3: File-Specific Review

```bash
$ copilens agent-review auth.py

📄 auth.py
══════════════════════════════
File: auth.py
AI Contribution: 89% (high confidence)
Quality Score: 3.2/5.0
Lines Changed: +247 / -12

Analysis:
This authentication module appears to be largely AI-generated.
The code shows comprehensive error handling and extensive
documentation typical of AI tools like GitHub Copilot...

💡 Suggestions
• High AI contribution - perform thorough manual review
• Verify all edge cases are handled correctly
• Security review required for high-risk changes
• Add comprehensive unit tests

⚠️  Security Concerns
• Password handling detected - ensure proper hashing
• API key usage detected - verify secure storage
```

## Agent Mode Features

### Contextual Understanding
The agent maintains context throughout the conversation:
- Knows which files have been analyzed
- Remembers previous questions
- Understands your repository state
- Provides relevant follow-up suggestions

### Multi-Agent Workflow

1. **Security Agent**
   - Scans for security vulnerabilities
   - Detects dangerous patterns (eval, exec, etc.)
   - Flags sensitive data handling

2. **Quality Agent**
   - Identifies code smells
   - Detects overly complex files
   - Finds code duplication

3. **Refactoring Agent**
   - Suggests structural improvements
   - Identifies splitting opportunities
   - Recommends pattern improvements

4. **Assessment Agent**
   - Generates overall risk assessment
   - Prioritizes files for review
   - Creates actionable summaries

## Configuration

Customize agent behavior in `.copilens.json`:

```json
{
  "version": "0.1.0",
  "copilot_agent": {
    "enabled": true,
    "use_agent_mode": true,
    "use_chat_api": true,
    "model": "gpt-4",
    "max_tokens": 2000,
    "temperature": 0.7
  }
}
```

## Fallback Mode

If GitHub Copilot is not available, Copilens automatically falls back to:
- Pattern-based explanations
- Rule-based suggestions
- Basic chat responses
- Standard analysis algorithms

**You'll see a warning:**
```
⚠ GitHub Copilot not detected
Running in basic mode...
```

## Performance

- **Chat responses**: ~2-5 seconds
- **File explanations**: ~3-8 seconds
- **Multi-agent analysis**: ~10-30 seconds (depending on file count)
- **Interactive review**: ~5-15 seconds per file

## Privacy & Security

- All Copilot interactions follow GitHub's privacy policy
- Code is sent to GitHub's AI service (if using agent mode)
- Fallback mode works completely offline
- No data is stored by Copilens (only GitHub Copilot)

## Troubleshooting

### "Copilot not detected"
```bash
# Install Copilot extension
gh extension install github/gh-copilot

# Verify authentication
gh auth status

# Test Copilot
gh copilot explain "test"
```

### "Command timed out"
- Check internet connection
- Verify GitHub Copilot subscription
- Try again (API may be temporarily unavailable)

### "Agent mode disabled"
```bash
# Enable in command
copilens chat --agent-mode

# Or enable in config
{
  "copilot_agent": {
    "enabled": true,
    "use_agent_mode": true
  }
}
```

## Comparison: Agent Mode vs Basic Mode

| Feature | Agent Mode | Basic Mode |
|---------|-----------|------------|
| Code Explanations | AI-powered, contextual | Pattern-based templates |
| Suggestions | Intelligent, code-aware | Rule-based generic |
| Security Analysis | Deep semantic analysis | Pattern matching |
| Quality Scoring | Context-aware | Heuristic-based |
| Chat Interactions | Natural conversation | Keyword matching |
| Performance | Requires internet | Fully offline |

## Best Practices

1. **Use agent mode for critical reviews** - Better accuracy and insights
2. **Fallback for quick checks** - Basic mode is faster
3. **Combine both** - Use agent mode to verify basic mode findings
4. **Review agent suggestions** - AI can make mistakes, verify recommendations
5. **Provide context** - More context = better agent responses

## Future Enhancements

- [ ] Fine-tuned models for code review
- [ ] Custom agent configurations
- [ ] Team-specific agent training
- [ ] Integration with GitHub Actions
- [ ] VS Code extension integration
- [ ] Offline agent mode (local LLM)

## Commands Summary

```bash
# Enhanced chat with agent mode
copilens chat

# Agent-powered review (single file)
copilens agent-review myfile.py

# Multi-agent comprehensive analysis
copilens agent-review --full

# Disable agent mode
copilens chat --no-agent-mode

# All other commands work as before
copilens stats
copilens diff
copilens risk
copilens explain
```

## Learn More

- GitHub Copilot docs: https://docs.github.com/copilot
- gh CLI docs: https://cli.github.com/
- Copilens algorithm: `AI_DETECTION_ALGORITHM.md`
- Testing guide: `TESTING_VALIDATION.md`

---

**Ready to use AI-powered code review?**

```bash
gh extension install github/gh-copilot
copilens agent-review --full
```

🚀 **Track AI, Trust Code - Now with AI-Powered Intelligence!**
