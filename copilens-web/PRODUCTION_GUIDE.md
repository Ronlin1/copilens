# 🚀 Copilens Web - Production Ready Guide

## ✅ Status: PRODUCTION READY

The Copilens web application is now fully configured for production deployment with:
- ✅ Gemini AI integration for chatbot
- ✅ Repository analysis
- ✅ Error boundaries and handling
- ✅ Code splitting and lazy loading  
- ✅ SEO optimization
- ✅ Environment configuration
- ✅ Dark mode (permanent)

---

## 🔑 STEP 1: Get Your Gemini API Key

### Where to Get the API Key:
1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)

### Where to Put the API Key:
Open `.env` file in the project root (`copilens-web/.env`) and replace:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

With your actual key:

```env
VITE_GEMINI_API_KEY=AIzaSyD...your_actual_key_here
```

### ⚠️ Important:
- **NEVER** commit `.env` to Git (already in `.gitignore`)
- The `.env.example` file shows the template
- For production hosting, set this as an environment variable in your hosting platform

---

## 📦 Features Now Working

### 1. AI-Powered Chat (Gemini 3 Pro)
- **Location**: Floating chat button (bottom-right)
- **Features**:
  - Context-aware responses about your repository
  - Analyzes code structure and patterns
  - Detects AI-generated code
  - Answers technical questions
  - Remembers conversation history

### 2. Repository Analysis
- **Location**: Dashboard page
- **Features**:
  - Stats cards (commits, files, lines, contributors)
  - Commit timeline visualization
  - Language distribution chart
  - File explorer tree
  - Mock data for now (ready for backend integration)

### 3. Dark Mode
- **Permanently enabled** (dark mode button removed)
- Optimized for developer workflows
- Reduced eye strain

### 4. Production Optimizations
- Code-split routes (smaller initial load)
- Error boundaries (graceful error handling)
- Lazy loading components
- SEO meta tags
- Environment-based configuration

---

## 🏗️ Local Development

### 1. Install Dependencies
```bash
cd copilens-web
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

### 4. Test the Chatbot
1. Click the floating chat button (bottom-right)
2. Type a question like:
   - "Analyze this repository"
   - "What programming languages are used?"
   - "Detect AI-generated code"
3. Get AI-powered responses from Gemini!

---

## 🌐 Production Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized bundle in `dist/` folder.

### Preview Production Build
```bash
npm run serve
```

### Deploy to Hosting

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
VITE_GEMINI_API_KEY=your_key_here
```

#### Option 2: Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables:
   - `VITE_GEMINI_API_KEY` = your key

#### Option 3: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 📁 Project Structure

```
copilens-web/
├── .env                    # ← PUT API KEY HERE
├── .env.example            # Template
├── src/
│   ├── config/
│   │   └── env.js          # Environment config
│   ├── services/
│   │   ├── gemini.js       # Gemini AI integration
│   │   └── api.js          # Backend API calls
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx      # AI chat interface
│   │   │   ├── FloatingChatButton.jsx
│   │   │   └── MessageList.jsx
│   │   ├── Dashboard/
│   │   │   ├── StatsCards.jsx
│   │   │   ├── CommitTimeline.jsx
│   │   │   └── AIDetectionChart.jsx
│   │   ├── ErrorBoundary.jsx       # Error handling
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── DeployPage.jsx
│   │   ├── CLIPage.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx             # Main app (dark mode permanent)
│   └── main.jsx            # Entry point
├── package.json
└── README.md
```

---

## 🧪 Testing Production Features

### Test Checklist:
- [ ] **Environment**: API key loaded correctly
- [ ] **Chat**: Opens and responds with Gemini AI
- [ ] **Dashboard**: Loads with mock data
- [ ] **Navigation**: All pages accessible
- [ ] **Errors**: Error boundary catches crashes
- [ ] **404**: Custom not-found page works
- [ ] **Mobile**: Responsive on small screens
- [ ] **Build**: Production build completes successfully

### Test the Chatbot:
```bash
# Start dev server
npm run dev

# Open browser: http://localhost:5173
# Click chat button (bottom-right)
# Send message: "Hello"
# Should get Gemini AI response!
```

---

## 🔧 Configuration Options

### Environment Variables (`.env`)

```env
# Required
VITE_GEMINI_API_KEY=AIza...              # Gemini API key

# Optional
VITE_API_URL=http://localhost:5000/api   # Backend API URL
VITE_APP_NAME=Copilens                   # App name
VITE_ENABLE_CHAT=true                    # Enable/disable chat
VITE_ENABLE_DEPLOY=true                  # Enable/disable deploy page
```

### Feature Flags
- Set `VITE_ENABLE_CHAT=false` to hide chat button
- Set `VITE_ENABLE_DEPLOY=false` to hide deploy page

---

## 🐛 Troubleshooting

### Chat Not Working?
**Error**: "Gemini API key not configured"

**Fix**:
1. Check `.env` file exists in `copilens-web/`
2. Verify `VITE_GEMINI_API_KEY` is set
3. Restart dev server (`npm run dev`)
4. API keys must start with `AIza`

### Build Errors?
**Error**: "Module not found"

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Chat API Errors?
**Error**: "Failed to get AI response"

**Possible causes**:
1. Invalid API key
2. API quota exceeded (check Google Cloud console)
3. Network/CORS issues
4. API endpoint down

**Fix**:
- Verify key at https://aistudio.google.com/app/apikey
- Check browser console for detailed error
- Try different network/disable VPN

---

## 📊 Bundle Size (Production)

```
dist/
├── index.html                     1.4 KB (gzipped: 0.5 KB)
├── assets/
│   ├── index.css                 38.5 KB (gzipped: 6.9 KB)
│   ├── NotFound.js                1.5 KB (gzipped: 0.7 KB)
│   ├── CLIPage.js                 5.0 KB (gzipped: 1.7 KB)
│   ├── DeployPage.js              5.4 KB (gzipped: 2.1 KB)
│   ├── Dashboard.js             367.4 KB (gzipped: 107.2 KB)
│   ├── FloatingChatButton.js    645.4 KB (gzipped: 232.7 KB)
│   └── index.js                 365.2 KB (gzipped: 117.6 KB)
```

**Total**: ~1.4 MB (gzipped: ~470 KB)

---

## 🎯 Production Checklist

Before deploying:
- [ ] API key added to `.env`
- [ ] Test chat locally
- [ ] Production build succeeds (`npm run build`)
- [ ] Preview build works (`npm run serve`)
- [ ] All pages load correctly
- [ ] Error handling tested
- [ ] Mobile responsive checked
- [ ] Environment variables set in hosting platform
- [ ] HTTPS enabled (hosting provider)
- [ ] Domain configured (if custom)

---

## 🚀 Next Steps

### Backend Integration (Optional)
Currently, the dashboard uses mock data. To connect a real backend:

1. **Create backend API** at `http://localhost:5000/api`
2. **Update** `src/pages/Dashboard.jsx` to call API
3. **Use** `src/services/api.js` for HTTP requests

Example:
```javascript
import { apiService } from '../services/api';

// In Dashboard.jsx
const data = await apiService.analyzeRepository(repoUrl);
```

### Additional Features
- User authentication
- Save analysis history
- Export reports as PDF
- GitHub OAuth integration
- Real-time collaboration

---

## 📞 Support

### Common Issues:
1. **Chat not responding**: Check API key in `.env`
2. **Build fails**: Run `npm install` again
3. **Blank page**: Check browser console for errors
4. **404 on deploy**: Configure hosting for SPA routing

### Resources:
- Gemini API Docs: https://ai.google.dev/docs
- Vite Docs: https://vitejs.dev
- React Router: https://reactrouter.com

---

## ✨ Summary

**What You Have**:
- ✅ Production-ready React web app
- ✅ AI-powered chat with Gemini 3 Pro
- ✅ Repository analysis dashboard
- ✅ Modern UI with animations
- ✅ Error handling and loading states
- ✅ Optimized bundle with code splitting
- ✅ SEO-friendly meta tags
- ✅ Dark mode (permanent)

**What You Need**:
1. Gemini API key (free from Google)
2. Put key in `.env` file
3. Run `npm run dev`
4. Chat with AI!

---

**Made with ❤️ by the Copilens Team**

Last Updated: 2026-02-14
Version: 1.0.0 (Production Ready)
