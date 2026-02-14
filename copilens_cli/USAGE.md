# Copilens CLI Installation & Usage Guide

## Quick Start

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Copilens CLI:**
   ```bash
   pip install -e .
   ```

   Or use the convenience script:
   ```bash
   install.bat    # Windows
   ```

### Verify Installation

```bash
copilens --help
```

## Usage Examples

### 1. Initialize in a Git Repository

```bash
cd your-git-repo
copilens init
```

### 2. View AI Statistics

```bash
# View stats for current changes
copilens stats

# View stats for staged changes only
copilens stats --staged
```

### 3. Analyze Diff

```bash
# Analyze all changes
copilens diff

# Analyze specific file
copilens diff --file myfile.py

# Analyze staged changes
copilens diff --staged
```

### 4. Check Risk Scores

```bash
# Check risk for all changes
copilens risk

# Set custom threshold
copilens risk --threshold 2.5

# Check staged changes
copilens risk --staged
```

### 5. Explain AI Changes

```bash
# Explain all changes
copilens explain

# Explain specific file
copilens explain myfile.py

# Explain staged changes
copilens explain --staged
```

### 6. Interactive Chat Mode

```bash
copilens chat
```

Ask questions like:
- "How is risk calculated?"
- "How do you detect AI code?"
- "What commands are available?"

### 7. Export Reports

```bash
# Export as JSON
copilens export report.json

# Export as CSV
copilens export report.csv --format csv

# Export staged changes
copilens export report.json --staged
```

### 8. View Trends (Coming Soon)

```bash
copilens trend --days 30
```

## Configuration

Copilens creates a `.copilens.json` file in your repository root:

```json
{
  "version": "0.1.0",
  "ai_threshold": 0.5,
  "risk_threshold": 3.0,
  "complexity_threshold": 10,
  "track_trends": true,
  "output_format": "rich"
}
```

## Understanding the Output

### AI Contribution
- **0-30%**: Low AI involvement
- **30-60%**: Moderate AI assistance
- **60-100%**: High AI generation

### Risk Levels
- **Low (0-2)**: Safe changes
- **Medium (2-3)**: Review recommended
- **High (3-4)**: Careful review needed
- **Critical (4-5)**: Thorough review required

### Risk Factors
1. **High AI Contribution**: Large percentage of AI-generated code
2. **Complexity Increase**: Significant complexity growth
3. **Large Code Insertion**: Many lines added at once
4. **Security-Sensitive File**: Changes to auth/security files
5. **Missing Test Coverage**: No tests for significant changes

## Development

### Running Tests

```bash
pytest
```

### Project Structure

```
copilens_cli/
├── src/
│   └── copilens/
│       ├── __init__.py
│       ├── cli.py              # Main CLI entry point
│       ├── commands/           # CLI commands
│       │   ├── init.py
│       │   ├── stats.py
│       │   ├── diff.py
│       │   ├── risk.py
│       │   ├── explain.py
│       │   ├── chat.py
│       │   ├── trend.py
│       │   └── export_report.py
│       ├── core/               # Core functionality
│       │   ├── git_analyzer.py
│       │   ├── ai_detector.py
│       │   └── config.py
│       ├── analyzers/          # Analysis engines
│       │   ├── complexity.py
│       │   ├── risk.py
│       │   └── metrics.py
│       └── ui/                 # UI components
│           ├── dashboard.py
│           └── output.py
├── tests/                      # Test suite
├── requirements.txt
├── setup.py
├── pyproject.toml
└── README.md
```

## Troubleshooting

### Command not found
Make sure you've installed the package:
```bash
pip install -e .
```

### Not a Git repository
Initialize Git first:
```bash
git init
```

### No changes detected
Make some changes or stage files:
```bash
git add .
copilens stats --staged
```

## Future Features

- GitHub Actions integration
- VS Code extension
- Team analytics
- Multi-AI support
- Security vulnerability scanning
- SaaS dashboard

## License

MIT
