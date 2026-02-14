# Copilens Deployment Guide

## Overview

Copilens can automatically detect your project type, prepare it for deployment, and deploy to various cloud platforms - all from the command line.

## Quick Start

```bash
# Fully autonomous deployment
cd your-project
copilens deploy --auto

# What happens:
# ✅ Detects project type (Node.js, Python, Go, etc.)
# ✅ Generates missing configs (Dockerfile, .dockerignore, etc.)
# ✅ Selects best platform (Vercel, Railway, Netlify, etc.)
# ✅ Deploys your application
# 🌐 Returns live URL
```

## Supported Platforms

### 1. Railway
- **Best for**: Node.js, Python, Go backends
- **Requires**: Railway CLI (`railway`)
- **Deploy**:
  ```bash
  # Install Railway CLI
  npm install -g @railway/cli
  
  # Login
  railway login
  
  # Deploy
  copilens deploy --platform railway
  ```

### 2. Vercel
- **Best for**: Next.js, React, Vue frontends
- **Requires**: Vercel CLI (`vercel`)
- **Coming soon** (manual: `vercel deploy`)

### 3. Netlify
- **Best for**: Static sites, JAMstack
- **Requires**: Netlify CLI (`netlify`)
- **Coming soon** (manual: `netlify deploy`)

### 4. Render
- **Best for**: Web services, databases
- **Requires**: Render CLI or API key
- **Coming soon**

### 5. Google Cloud Run
- **Best for**: Containerized apps
- **Requires**: `gcloud` CLI
- **Coming soon**

## Commands

### Deploy Project

```bash
# Auto-select best platform
copilens deploy --auto

# Specific platform
copilens deploy --platform railway

# Prepare only (don't deploy)
copilens deploy --prepare
```

### Detect Architecture

```bash
# Analyze project structure
copilens detect-arch

# Output:
# ┌─────────────────────────────────────────┐
# │       Project Architecture              │
# ├──────────────────────┬──────────────────┤
# │ Project Type         │ fullstack        │
# │ Primary Language     │ typescript       │
# │ Frameworks           │ nextjs, express  │
# │ Has Frontend         │ ✓                │
# │ Has Backend          │ ✓                │
# │ Package Manager      │ pnpm             │
# │ Deployment Ready     │ ✗                │
# │ Recommended Platform │ vercel           │
# └──────────────────────┴──────────────────┘
```

### Check Deployment Status

```bash
# View deployment history
copilens deploy-status
```

## How It Works

### 1. Architecture Detection

Copilens automatically detects:

**Languages:**
- JavaScript/TypeScript
- Python
- Go
- Java
- Rust
- PHP
- Ruby

**Frameworks:**
- **Frontend**: React, Vue, Angular, Svelte, Next.js, Nuxt.js
- **Backend**: Express, FastAPI, Django, Flask, NestJS, Rails, Spring Boot
- **Mobile**: React Native, Flutter
- **Desktop**: Electron

**Project Types:**
- Frontend
- Backend
- Fullstack
- Mobile
- Desktop
- Library
- CLI

### 2. Configuration Generation

If missing, Copilens generates:

#### Dockerfile
```dockerfile
# Auto-generated based on project type
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### .dockerignore
```
node_modules
__pycache__
.git
.env
dist
build
coverage
```

#### .env.example
```bash
# Auto-generated from .env
DATABASE_URL=
API_KEY=
PORT=
```

#### README.md
Basic project documentation

### 3. Platform Selection

**Selection Logic:**

| Project Type | Detected Framework | Recommended Platform |
|--------------|-------------------|---------------------|
| Frontend | React | Vercel/Netlify |
| Frontend | Next.js | Vercel |
| Frontend | Vue/Nuxt | Netlify |
| Backend | Node.js | Railway |
| Backend | Python | Railway/Render |
| Backend | Go | Railway/Cloud Run |
| Fullstack | Next.js | Vercel |
| Fullstack | Any | Vercel |
| Has Dockerfile | - | Cloud Run |

### 4. Deployment

Platform-specific deployment steps:

**Railway:**
1. Check authentication
2. Initialize project
3. Deploy with `railway up`
4. Return deployment URL

**Others:** (Coming soon)
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- Render: API-based deployment

## Advanced Usage

### Custom Configuration

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables

```bash
# Set in .env file
DATABASE_URL=postgresql://...
API_KEY=secret-key
PORT=3000

# Copilens will generate .env.example automatically
```

### Multi-Environment Deployment

```bash
# Production
copilens deploy --platform railway --env production

# Staging  
copilens deploy --platform railway --env staging
```

## Deployment Checklist

Before deployment, ensure:

- [ ] Code is committed to Git
- [ ] Environment variables documented in .env.example
- [ ] Dependencies are listed (package.json, requirements.txt, etc.)
- [ ] Build scripts defined
- [ ] Start script defined
- [ ] Port configured (usually from env var)
- [ ] Database migrations ready (if applicable)

## Example Workflows

### Node.js + Express API

```bash
cd my-api
copilens detect-arch
# → Detected: Backend, Node.js, Express
# → Recommended: Railway

copilens deploy --auto
# ✅ Generated Dockerfile
# ✅ Generated .dockerignore
# ✅ Deployed to Railway
# 🌐 https://my-api-production.railway.app
```

### Next.js App

```bash
cd my-nextjs-app
copilens deploy --platform vercel
# (Once implemented)
# 🌐 https://my-app.vercel.app
```

### Python FastAPI

```bash
cd my-fastapi-app
copilens deploy --auto
# → Detected: Backend, Python, FastAPI
# → Recommended: Railway

# Output:
# ✅ Generated Dockerfile (Python 3.11)
# ✅ Generated .dockerignore
# ✅ Deployed to Railway
# 🌐 https://my-fastapi-app.railway.app
```

## Monitoring After Deployment

After deployment, start monitoring:

```bash
# Get deployment URL from output
DEPLOYED_URL="https://my-app.railway.app"

# Start 24/7 monitoring
copilens monitor start $DEPLOYED_URL --interval 60

# Configure alerts
copilens monitor configure-alerts --slack https://hooks.slack.com/...
```

## Troubleshooting

### "Platform not available"
**Cause**: CLI not installed
**Solution**: Install platform CLI
```bash
npm install -g @railway/cli
```

### "Not logged in"
**Cause**: Not authenticated
**Solution**: Login to platform
```bash
railway login
```

### "Deployment failed"
**Cause**: Various (check logs)
**Solution**: 
1. Check deployment logs
2. Verify build command works locally
3. Check environment variables
4. Ensure dependencies are correct

### "No compatible platform found"
**Cause**: Unsupported project type
**Solution**: 
1. Add Dockerfile manually
2. Use `--platform` flag explicitly

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Copilens
        run: pip install -e .
      
      - name: Deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: copilens deploy --platform railway
```

## Cost Estimation

### Railway
- **Free Tier**: $5/month credit
- **Hobby**: $5/month
- **Pro**: $20/month

### Vercel
- **Free**: Hobby projects
- **Pro**: $20/month

### Netlify
- **Free**: 100GB bandwidth
- **Pro**: $19/month

## Next Steps

1. **Deploy**: `copilens deploy --auto`
2. **Monitor**: `copilens monitor start <url>`
3. **Configure Alerts**: `copilens monitor configure-alerts`
4. **Automate**: Set up CI/CD

## Support

Questions? Reach out to **atuhaire.com/connect**
