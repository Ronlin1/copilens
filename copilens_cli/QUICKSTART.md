# Copilens CLI - Quick Start Guide

## Installation (2 minutes)

### Step 1: Install Dependencies
```bash
cd copilens_cli
pip install typer rich GitPython radon pandas numpy pydantic textual
```

### Step 2: Install Copilens
```bash
pip install -e .
```

### Step 3: Verify
```bash
copilens --help
```

**Expected Output:**
```
Usage: copilens [OPTIONS] COMMAND [ARGS]...

  Copilens CLI - Track and analyze AI-generated code changes

Commands:
  init     Initialize Copilens in your Git repository
  stats    Display AI contribution statistics
  diff     Analyze git diff for AI patterns
  risk     Analyze risk in code changes
  explain  Explain AI-generated code changes
  chat     Interactive chat mode for explaining AI changes
  trend    View AI contribution trends over time
  export   Export analysis report to file
```

## First Use (5 minutes)

### 1. Go to a Git Repository
```bash
cd your-project-folder
```

### 2. Initialize Copilens
```bash
copilens init
```

**Output:**
```
✓ Copilens initialized in your-project-folder
ℹ Configuration saved to .copilens.json
```

### 3. Make Some Code Changes
```bash
# Edit some files in your repository
# Or work with existing uncommitted changes
```

### 4. View AI Statistics
```bash
copilens stats
```

**Sample Output:**
```
╭──────────────────── Copilens Dashboard ────────────────────╮
│                                                            │
│ Metric                Value                               │
│ AI Contribution       ████████░░ 43%                      │
│ Risk Score            ███░░░░░░ 3.2 / 5                   │
│ Complexity Δ          ↑ +14                               │
│ Files Impacted        7                                   │
│ Lines Added           +245                                │
│ Lines Deleted         -12                                 │
│                                                            │
╰────────────────────────────────────────────────────────────╯

┌─────────────────┬────────┬────────────┬──────────┐
│ File            │ AI %   │ Complexity │ Risk     │
├─────────────────┼────────┼────────────┼──────────┤
│ auth.py         │ 68%    │ +3         │ HIGH     │
│ service.py      │ 54%    │ +2         │ MEDIUM   │
│ utils.py        │ 22%    │ 0          │ LOW      │
└─────────────────┴────────┴────────────┴──────────┘
```

### 5. Check Risk Scores
```bash
copilens risk
```

### 6. Get Detailed Explanation
```bash
copilens explain auth.py
```

### 7. Export Report
```bash
copilens export report.json
```

## Common Workflows

### Before Committing
```bash
# Check what you're about to commit
git add .
copilens stats --staged
copilens risk --staged

# If risk is acceptable, commit
git commit -m "Your message"
```

### Code Review
```bash
# Analyze specific files
copilens diff --file src/critical.py
copilens explain src/critical.py

# Export for review
copilens export review.csv --format csv
```

### Interactive Exploration
```bash
copilens chat
```

Then ask:
- "How is risk calculated?"
- "How do you detect AI code?"
- "What should I look for in high-risk files?"

## Understanding the Output

### AI Contribution
- **0-30%**: Minimal AI - mostly human code
- **30-60%**: Mixed - AI assisted development
- **60-100%**: High AI - generated code, review carefully

### Risk Levels
- 🟢 **Low (0-2)**: Safe to proceed
- 🟡 **Medium (2-3)**: Quick review recommended
- 🟠 **High (3-4)**: Careful review needed
- 🔴 **Critical (4-5)**: Thorough review required

### What Increases Risk?
1. High AI percentage (>70%)
2. Large complexity increases
3. Big code insertions (>100 lines)
4. Security-sensitive files (auth, config, etc.)
5. Missing test coverage

## Tips & Best Practices

1. **Initialize early**: Run `copilens init` when starting a new project
2. **Check before commit**: Make it part of your workflow
3. **Use thresholds**: Set custom risk levels for your team
4. **Export regularly**: Track trends over time
5. **Review high-risk**: Always review files marked as high risk
6. **Test AI code**: Add extra tests for AI-generated code

## Troubleshooting

### "Not a Git repository"
```bash
git init
copilens init
```

### "No changes detected"
```bash
# Make some changes first, or check staged changes
git add .
copilens stats --staged
```

### "Command not found: copilens"
```bash
# Reinstall
pip install -e .

# Or check Python path
python -m copilens --help
```

## Next Steps

- Read **USAGE.md** for detailed examples
- Read **PROJECT_SUMMARY.md** for architecture details
- Run `pytest` to see the test suite
- Explore the code in `src/copilens/`

## Need Help?

1. Run `copilens chat` for interactive help
2. Use `--help` with any command: `copilens stats --help`
3. Check documentation files in the project

---

**Happy coding with transparency! 🚀**
