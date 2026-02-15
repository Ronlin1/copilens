# GitHub API Token Setup Guide

## 🚨 Getting 403 Errors? You Need a GitHub Token!

### Why You're Getting 403 Errors

GitHub API has strict rate limits:
- **Without Token**: 60 requests/hour ❌
- **With Token**: 5,000 requests/hour ✅

When analyzing a repository, Copilens makes ~15-20 API requests, so you'll hit the limit after just 3-4 analyses per hour without a token.

---

## 🔑 Step-by-Step: Get Your GitHub Token

### Step 1: Go to GitHub Settings
Open this link in your browser:
```
https://github.com/settings/tokens
```

### Step 2: Generate New Token
1. Click the **"Generate new token"** button (green button in top-right)
2. Select **"Generate new token (classic)"**

### Step 3: Configure Token
1. **Note/Name**: Enter `Copilens Analysis` (or any name you like)
2. **Expiration**: Choose `No expiration` or `90 days` (recommended)
3. **Select scopes** (checkboxes to enable):
   - ✅ **repo** - Full control of private repositories
   - ✅ **public_repo** - Access public repositories
   - ✅ **read:user** - Read user profile data

### Step 4: Generate & Copy
1. Scroll to bottom and click **"Generate token"** (green button)
2. **IMPORTANT**: Copy the token immediately!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again after leaving the page
   - If you lose it, you'll have to create a new one

---

## 📝 Add Token to Copilens

### Step 1: Open .env File
Navigate to:
```
copilens/copilens-web/.env
```

### Step 2: Add Your Token
Find this line:
```env
VITE_GITHUB_TOKEN=
```

Replace it with your token (paste after the `=`):
```env
VITE_GITHUB_TOKEN=ghp_your_actual_token_here
```

**Example:**
```env
VITE_GITHUB_TOKEN=ghp_abc123xyz789definitelynotarealtoken456
```

### Step 3: Restart Development Server
If the server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then start again
cd copilens-web
npm run dev
```

---

## ✅ Verify It's Working

### 1. Check Console Logs
When you start the dev server or analyze a repo, you should see:
```
✅ GitHub API: Using authenticated requests (5,000/hour)
```

Instead of:
```
⚠️  GitHub API: Using unauthenticated requests (60/hour)
```

### 2. Test Analysis
1. Go to http://localhost:5173
2. Enter a GitHub URL: `https://github.com/Tech-Atlas-Uganda/tech_atlas`
3. Click "Analyze Repository"
4. Should work without 403 errors!

### 3. Check Rate Limit
Open browser console (F12) and look for:
```
📊 GitHub API Rate Limit: {
  remaining: 4999,
  limit: 5000,
  reset: '4:45:00 PM'
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep your token secret
- Add `.env` to `.gitignore` (already done)
- Use token with minimal required scopes
- Regenerate token if accidentally exposed

### ❌ DON'T:
- Share your token publicly
- Commit token to Git
- Post token in screenshots or videos
- Use same token for multiple apps (create separate ones)

---

## 🐛 Troubleshooting

### Still Getting 403 Errors?

#### Check 1: Token Format
Make sure there are NO spaces:
```env
# ❌ WRONG
VITE_GITHUB_TOKEN= ghp_abc123

# ✅ CORRECT
VITE_GITHUB_TOKEN=ghp_abc123
```

#### Check 2: Token Scopes
Your token must have at least:
- `public_repo` (for public repos)
- `repo` (for private repos, if needed)

Go back to https://github.com/settings/tokens and check the scopes.

#### Check 3: Token Not Expired
Check if your token has expired. If so, generate a new one.

#### Check 4: Restart Required
After adding token to `.env`, you MUST restart the dev server:
```bash
Ctrl+C  # Stop server
npm run dev  # Start again
```

### Still Getting Rate Limit Errors?

Check your current usage:
```bash
curl -H "Authorization: token YOUR_TOKEN_HERE" https://api.github.com/rate_limit
```

Or just wait for the reset time shown in console logs.

---

## 📊 Rate Limits Explained

### Unauthenticated (No Token)
- **Limit**: 60 requests per hour
- **Per**: IP address
- **Reset**: Every hour on the clock
- **Good for**: Quick tests only

### Authenticated (With Token)
- **Limit**: 5,000 requests per hour
- **Per**: User account
- **Reset**: Every hour from first request
- **Good for**: Production use ✅

### What Copilens Uses
For one repository analysis:
- ~5 requests: Repository info, commits, branches, etc.
- ~5 requests: Stats endpoints (code frequency, commit activity)
- ~5 requests: PRs, issues, releases
- ~15 requests: File contents (for AI analysis)

**Total**: ~15-30 requests per analysis

---

## 🎯 Quick Reference

### Create Token
```
https://github.com/settings/tokens
→ Generate new token (classic)
→ Select: repo, public_repo, read:user
→ Copy token
```

### Add to .env
```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

### Restart Server
```bash
cd copilens-web
npm run dev
```

### Verify
```
Console should show: ✅ GitHub API: Using authenticated requests
```

---

## 🆘 Need Help?

### Token Not Working?
1. Double-check token is copied correctly
2. Ensure `.env` file is in `copilens-web/` directory
3. Restart dev server completely
4. Check browser console for error messages

### Lost Your Token?
1. Go to https://github.com/settings/tokens
2. Delete the old token
3. Create a new one
4. Update `.env` with new token

### Want to Revoke Access?
1. Go to https://github.com/settings/tokens
2. Click "Delete" next to the token
3. Confirm deletion

---

## ✨ Benefits of Using Token

✅ **5,000 requests/hour** (vs 60 without)
✅ **No 403 errors** during analysis
✅ **Access to all GitHub data** reliably
✅ **Faster analysis** (no rate limit waiting)
✅ **Analyze private repos** (if scopes allow)
✅ **Better user experience** for your users

---

## 📚 Additional Resources

- GitHub Token Documentation: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- GitHub API Rate Limits: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
- GitHub API Scopes: https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps

---

## 🚀 You're All Set!

Once you've added your token and restarted the server, Copilens will have full access to GitHub API and you can analyze repositories without any 403 errors!

**Test it now:**
1. Go to http://localhost:5173
2. Analyze: https://github.com/Tech-Atlas-Uganda/tech_atlas
3. Check console for "✅ Using authenticated requests"
4. Enjoy unlimited analyses! 🎉
