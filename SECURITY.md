# 🔒 Security Guidelines for Copilens

## ⚠️ CRITICAL: Never Commit Secrets!

**API keys, tokens, and passwords must NEVER be committed to git.**

---

## ✅ Checklist Before Every Commit

- [ ] No API keys in code files
- [ ] No tokens in documentation
- [ ] `.env` files are in `.gitignore`
- [ ] Only `.env.example` files are committed (with placeholders)
- [ ] No hardcoded passwords or secrets

---

## 🔑 Managing API Keys Securely

### ✅ DO:

1. **Use Environment Variables**
   ```bash
   # In your .env file (NEVER commit this)
   VITE_GEMINI_API_KEY=your-actual-key-here
   VITE_GITHUB_TOKEN=your-actual-token-here
   ```

2. **Use .env.example for Templates**
   ```bash
   # In .env.example (safe to commit)
   VITE_GEMINI_API_KEY=
   VITE_GITHUB_TOKEN=
   ```

3. **Add .env to .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

4. **Access via Environment Variables in Code**
   ```javascript
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
   ```

### ❌ DON'T:

1. **Never hardcode API keys**
   ```javascript
   // ❌ NEVER DO THIS
   const API_KEY = 'AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz';
   ```

2. **Never commit .env files**
   ```bash
   # ❌ NEVER DO THIS
   git add .env
   git commit -m "Add config"
   ```

3. **Never put real keys in documentation**
   ```markdown
   <!-- ❌ NEVER DO THIS -->
   Set your API key: AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
   ```

---

## 🚨 If You Accidentally Expose a Secret

### Immediate Actions:

1. **REVOKE THE KEY IMMEDIATELY**
   - Google API Key: https://console.cloud.google.com/apis/credentials
   - GitHub Token: https://github.com/settings/tokens
   
2. **Remove from Code**
   ```bash
   # Replace the key with a placeholder
   git add .
   git commit -m "SECURITY: Remove exposed API key"
   ```

3. **Generate a New Key**
   - Never reuse a compromised key
   - Create a fresh one with minimum required permissions

4. **Update Locally**
   ```bash
   # Update your .env file with the new key
   echo "VITE_GEMINI_API_KEY=new-key-here" > copilens-web/.env
   ```

---

## 📋 Environment Variables Reference

### Required for Production:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_GEMINI_API_KEY` | Gemini AI API key | https://aistudio.google.com/app/apikey |
| `VITE_GITHUB_TOKEN` | GitHub personal access token | https://github.com/settings/tokens |

### Optional:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_ENABLE_CHAT` | Enable AI chat | `true` |
| `VITE_ENABLE_DEPLOY` | Enable deployment features | `true` |

---

## 🛡️ Security Best Practices

1. **Principle of Least Privilege**
   - Only grant minimum required permissions
   - For GitHub tokens: only select needed scopes

2. **Regular Key Rotation**
   - Rotate API keys every 90 days
   - Immediately rotate if compromise suspected

3. **Use Separate Keys for Development/Production**
   ```bash
   # .env.development
   VITE_GEMINI_API_KEY=dev-key-here
   
   # .env.production
   VITE_GEMINI_API_KEY=prod-key-here
   ```

4. **Monitor API Usage**
   - Check Google Cloud Console for unusual activity
   - Review GitHub token usage regularly

5. **Never Share Keys**
   - Don't share via email, chat, or screenshots
   - Use secure password managers if needed

---

## 🔍 Scanning for Exposed Secrets

Before pushing code, scan for potential secrets:

```bash
# Check for API key patterns
git grep -E "AIza[0-9A-Za-z_-]{35}"
git grep -E "ghp_[0-9A-Za-z]{36}"
git grep -E "(api_key|apiKey|API_KEY)\s*[:=]\s*['\"][^'\"]{10,}"

# Check git history for secrets
git log -p -S "AIzaSy" --all
```

---

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly
3. Include details about the vulnerability
4. Allow time for a fix before public disclosure

---

## ✅ Pre-Commit Checklist

Before every `git commit`:

```bash
# 1. Verify no .env files are staged
git status | grep ".env"

# 2. Check for API key patterns
git diff --cached | grep -E "(AIza|ghp_|api_key.*=.*['\"])"

# 3. Review what you're committing
git diff --cached

# 4. Only commit if clean
git commit -m "Your message"
```

---

## 🎓 Additional Resources

- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [GitHub Token Security](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Remember: Security is everyone's responsibility! 🔒**
