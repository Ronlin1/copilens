<div align="center">

# COPILENS

**AI-Powered Repository Intelligence**

*Paste a GitHub URL. Get instant AI analysis, complexity metrics, architecture diagrams, and deployment insights.*

</div>

---

## What is Copilens?

Copilens is an open-source platform that lets you drop any public GitHub URL and instantly get a full picture of the codebase — AI detection scores, complexity metrics, architecture diagrams, contributor insights, and deployment recommendations. No setup, no cloning, no waiting.

It ships as both a **web app** (React + Vite) and a **CLI tool** (Python), so you can use it wherever you work.

---

## Features

| Feature | Description |
|---|---|
| **AI Code Detection** | Detects AI-generated code patterns using Llama 3.3 70B via Groq |
| **Deep Analytics** | Cyclomatic complexity, cognitive complexity, maintainability index, risk scoring |
| **Architecture Diagrams** | Auto-generated system architecture from code structure |
| **Commit Timeline** | Visual history of activity with AI-detected commit breakdown |
| **Deployment Detection** | Identifies Vercel, Netlify, Railway, Heroku, Docker configs automatically |
| **AI Chat** | Ask questions about any analyzed repo in natural language |
| **CLI Tool** | Full-featured Python CLI for terminal-based workflows |
| **Real-time Progress** | Live notifications as data is fetched and analyzed |

---

## Project Structure

```
copilens/
├── copilens-web/          # React 19 + Vite web application
│   ├── src/
│   │   ├── components/    # UI components (Dashboard, Chat, etc.)
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API integrations (Groq, GitHub)
│   │   └── utils/         # Helpers (complexity, systems thinking)
│   └── ...
└── copilens_cli/          # Python CLI tool
    ├── src/copilens/
    │   ├── analyzers/     # Repo, complexity, risk analyzers
    │   ├── commands/      # CLI commands (stats, chat, deploy...)
    │   └── agentic/       # LLM provider integrations
    └── ...
```

---

## Quick Start

### Web App

**Requirements:** Node.js 18+, a [Groq API key](https://console.groq.com) (free), a [GitHub token](https://github.com/settings/tokens) (optional, increases rate limits)

```bash
git clone https://github.com/Ronlin1/copilens
cd copilens/copilens-web
npm install
cp .env.example .env
# Fill in your keys in .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), paste a GitHub URL, hit **Analyze**.

**Environment variables:**

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_GITHUB_TOKEN=your_github_token   # optional but recommended
```

---

### CLI Tool

**Requirements:** Python 3.9+

```bash
cd copilens/copilens_cli
pip install -r requirements.txt
pip install -e .
copilens config setup   # add your API keys
copilens stats          # analyze current directory
```

**Key commands:**

```bash
copilens stats                        # repo statistics + AI detection
copilens chat                         # interactive AI chat about your code
copilens analyze                      # deep complexity analysis
copilens deploy                       # detect + deploy to cloud platforms
copilens remote https://github.com/…  # analyze any remote repo
```

---

## Tech Stack

**Web**
- React 19, Vite 8, Tailwind CSS v4, Framer Motion
- Groq SDK (Llama 3.3 70B) for AI analysis
- GitHub REST API for repository data
- Recharts for data visualization, Mermaid.js for diagrams

**CLI**
- Python 3.9+, Click for command interface
- Groq / Gemini LLM providers
- GitPython for local repo analysis

---

## Current Limitations

- Public GitHub repositories only (private repo support coming soon)
- One-click deploy is in development — deployment detection works, actual deploy does not yet
- GitLab and Bitbucket support is experimental
- Large repos (10k+ commits) may hit GitHub API rate limits without a token

---

## Roadmap

- [ ] One-click deploy to Vercel, Netlify, Railway
- [ ] Private repo support via GitHub OAuth
- [ ] Pull request analysis and automated code review
- [ ] Team workspaces and shared analysis sessions
- [ ] VS Code extension

---

## Contributing

PRs are welcome. Open an issue first for major changes.

```bash
git clone https://github.com/Ronlin1/copilens
cd copilens/copilens-web && npm install
npm run dev
```

---

## License

MIT © Copilens
