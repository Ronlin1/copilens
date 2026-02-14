# Copilens Web - Production Deployment Guide

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Visit: http://localhost:5173

### Production Build
```bash
npm run build
npm run serve
```

## 📦 Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
VITE_API_URL=https://your-api.com/api
VITE_APP_NAME=Copilens
VITE_ENABLE_CHAT=true
VITE_ENABLE_DEPLOY=true
```

## 🏗️ Production Features

### ✅ Implemented
- **Code Splitting**: Lazy-loaded routes reduce initial bundle size
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **SEO Optimization**: Proper meta tags for search engines
- **Environment Config**: Centralized configuration via `.env`
- **404 Page**: Custom not-found page
- **Loading States**: Suspense fallbacks for better UX
- **Production Error Handling**: Console logs removed in production
- **Bundle Optimization**: Vendor chunks separated for better caching
- **Security**: No sensitive data exposure
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference support
- **Performance**: Optimized animations and rendering

### 📊 Bundle Analysis
```
dist/
├── index.html (0.45 KB)
├── assets/
│   ├── index.css (37 KB gzipped: 6.7 KB)
│   ├── react-vendor.js (~300 KB gzipped)
│   ├── ui-vendor.js (~200 KB gzipped)
│   ├── chart-vendor.js (~100 KB gzipped)
│   └── code-vendor.js (~80 KB gzipped)
```

## 🌐 Deployment Options

### Vercel (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### Docker
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t copilens-web .
docker run -p 8080:80 copilens-web
```

### Static Hosting (GitHub Pages, S3, etc.)
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Configuration

### API Integration
Update `src/config/env.js` to point to your backend:
```javascript
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ...
};
```

### Feature Flags
Control features via environment variables:
```env
VITE_ENABLE_CHAT=false  # Disable chat
VITE_ENABLE_DEPLOY=true # Enable deploy page
```

## 🐛 Debugging

### Development
- Open browser DevTools
- Check Console for errors
- Use React DevTools extension

### Production
- Errors are caught by Error Boundaries
- Users see friendly error messages
- Check browser console (prod mode hides some logs)

## 📱 Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS Safari 13+, Chrome Android 90+

## ⚡ Performance Tips

1. **Lazy Loading**: Routes are already lazy-loaded
2. **Image Optimization**: Use WebP format for images
3. **CDN**: Deploy to CDN for faster global access
4. **Caching**: Vendor chunks rarely change (better caching)
5. **Compression**: Enable gzip/brotli on server

## 🔒 Security

### Checklist
- [x] No API keys in frontend code
- [x] Environment variables for sensitive config
- [x] HTTPS in production (via hosting provider)
- [x] Content Security Policy (configure in hosting)
- [x] No console.log in production
- [x] Input validation for user data
- [x] XSS protection (React default)

## 📚 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.2.0 |
| Build Tool | Vite | 8.0.0-beta.14 |
| Routing | React Router | 7.13.0 |
| Styling | Tailwind CSS | 4.1.18 |
| Animations | Framer Motion | 12.34.0 |
| Icons | Lucide React | 0.564.0 |
| Charts | Recharts | 3.7.0 |
| HTTP Client | Axios | 1.13.5 |

## 🎯 Production Checklist

Before deploying:
- [ ] Update `.env` with production API URL
- [ ] Test production build locally (`npm run build && npm run serve`)
- [ ] Verify all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Check browser console for errors
- [ ] Verify dark mode works
- [ ] Test navigation between pages
- [ ] Check loading states
- [ ] Verify error boundaries
- [ ] Test 404 page
- [ ] Review bundle size
- [ ] Enable compression on server
- [ ] Configure CDN (optional)
- [ ] Set up monitoring/analytics (optional)

## 📞 Support

For issues:
1. Check browser console
2. Verify environment variables
3. Ensure backend API is running
4. Check network requests in DevTools
5. Review error boundary messages

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ by the Copilens Team**
