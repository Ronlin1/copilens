# Copilens - AI-Powered Repository Analysis

AI-powered repository analysis and deployment platform with integrated chatbot.

## Features

- 🤖 AI Code Analysis with Gemini 3
- 📊 Repository Statistics & Insights
- 💬 Interactive AI Chatbot
- 🚀 One-Click Deployment
- 🎨 Modern Web Interface
- 💻 Command Line Interface

## Project Structure

```
copilens/
├── copilens-web/          # React web application
├── copilens_cli/          # Python CLI tool
└── docs/                  # Documentation
```

## Quick Start

### Web Application

```bash
cd copilens-web
npm install
# Add VITE_GEMINI_API_KEY to .env
npm run dev
```

Visit: http://localhost:5173

### CLI Tool

```bash
cd copilens_cli
pip install -r requirements.txt
pip install -e .
copilens --help
```

## Documentation

- [Web App Setup](copilens-web/PRODUCTION_GUIDE.md)
- [CLI Documentation](copilens_cli/README.md)

## License

MIT

## Author

Built with ❤️ by the Copilens Team
