# API Key Setup Guide - Simple & Clear

## 🚀 Quick Setup (Recommended)

### Step 1: Run Setup Wizard

```powershell
copilens config setup
```

This interactive wizard will:
- Guide you through getting a free Gemini API key
- Save it securely in `~/.copilens/config.json`
- Optionally set up OpenAI and Anthropic keys

**That's it!** Your API key is saved and ready to use.

---

## 📍 Where Your API Key is Stored

**Config File Location:**
```
Windows: C:\Users\YourName\.copilens\config.json
Mac/Linux: ~/.copilens/config.json
```

**Format:**
```json
{
  "api_keys": {
    "gemini": "your-actual-api-key-here",
    "openai": "optional-openai-key",
    "anthropic": "optional-anthropic-key"
  }
}
```

**This file is:**
- ✅ Local to your computer (not shared)
- ✅ Used automatically by all Copilens commands
- ✅ Overridden by environment variables if set

---

## 🔑 Getting Your Free Gemini API Key

### Option 1: Through Setup Wizard
```powershell
copilens config setup
```

### Option 2: Manual Steps

1. **Visit:** https://makersuite.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click** "Create API Key"

4. **Copy** the key (starts with something like `AIza...`)

5. **Save it:**
```powershell
copilens config set gemini YOUR_API_KEY_HERE
```

**Example:**
```powershell
copilens config set gemini AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

---

## ✅ Verify Your Setup

```powershell
copilens config show
```

**You should see:**
```
🔑 API Key Configuration

  ✓ GEMINI      AIzaSyD1...wxyz (config file)
  ✗ OPENAI      Not set
  ✗ ANTHROPIC   Not set

Config file: C:\Users\YourName\.copilens\config.json
```

---

## 🎯 Three Ways to Set API Keys

### Method 1: Config File (Recommended) ⭐

```powershell
# One-time setup
copilens config set gemini YOUR_KEY

# Key is saved permanently
# Works for all future commands
```

**Advantages:**
- ✅ Set once, use forever
- ✅ Automatic for all commands
- ✅ Easy to update or remove

### Method 2: Environment Variable (Current Session)

```powershell
# PowerShell
$env:GEMINI_API_KEY="YOUR_KEY"

# Now run commands
copilens chat-ai interactive
```

**Advantages:**
- ✅ Quick for testing
- ✅ Doesn't save to disk
- ❌ Only lasts current session

### Method 3: Environment Variable (Permanent)

```powershell
# PowerShell (Admin)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'YOUR_KEY', 'User')

# Restart PowerShell
# Key is now permanent
```

**Advantages:**
- ✅ Works across all terminals
- ✅ Permanent until removed
- ❌ More complex to set up

---

## 🎨 Using Your API Key

Once set up, these features automatically work:

### 1. Interactive AI Chat
```powershell
copilens chat-ai interactive
```

Chat with Gemini 3 Pro about your code!

### 2. Repository Analysis
```powershell
copilens stats --full --llm
```

Get AI-powered insights about your codebase.

### 3. Remote Repository Analysis
```powershell
copilens remote analyze https://github.com/user/repo
```

Analyze any public GitHub/GitLab repository.

### 4. Code Generation
```powershell
copilens generate generate "REST API for user management"
```

Generate code from descriptions.

### 5. Quick Questions
```powershell
copilens chat-ai quick "What are Python best practices?"
```

Ask one-off questions without entering chat mode.

---

## 🔧 Managing Your API Keys

### View Current Configuration
```powershell
copilens config show
```

### Update an API Key
```powershell
copilens config set gemini NEW_KEY
```

### Remove an API Key
```powershell
copilens config remove gemini
```

### Get Help on Getting Keys
```powershell
copilens config get-key
```

Shows links and instructions for all providers.

---

## 🆘 Troubleshooting

### "No Gemini API key found"

**Solution 1: Check if set**
```powershell
copilens config show
```

**Solution 2: Run setup**
```powershell
copilens config setup
```

**Solution 3: Set manually**
```powershell
copilens config set gemini YOUR_KEY
```

### "Invalid API key"

1. Check the key is correct:
   ```powershell
   copilens config show
   ```

2. Get a new key:
   - Visit: https://makersuite.google.com/app/apikey
   - Create new key
   - Update: `copilens config set gemini NEW_KEY`

### "Config file not found"

This is normal! The config file is created automatically when you run:
```powershell
copilens config setup
```
or
```powershell
copilens config set gemini YOUR_KEY
```

### API Key Not Working After Setting

**Restart your terminal** to ensure environment variables are reloaded.

---

## 💡 Pro Tips

### 1. Use Config File for Daily Work
```powershell
copilens config set gemini YOUR_KEY
# Set once, forget about it
```

### 2. Use Environment Variable for CI/CD
```yaml
# GitHub Actions example
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### 3. Check Configuration Before Sharing
```powershell
# Make sure not to share your config file
# It's in: ~/.copilens/config.json
```

### 4. Multiple API Keys for Fallback
```powershell
copilens config set gemini YOUR_GEMINI_KEY
copilens config set openai YOUR_OPENAI_KEY

# Copilens will try Gemini first, then OpenAI if Gemini fails
```

---

## 📊 What Each Provider Does

| Provider | Used For | Cost |
|----------|----------|------|
| **Gemini** | Main AI features (chat, analysis, generation) | FREE tier available |
| **OpenAI** | Fallback for Gemini, GPT-specific features | Paid (starts at $0.002/1k tokens) |
| **Anthropic** | Fallback for both, Claude-specific features | Paid (starts at $0.003/1k tokens) |

**Recommendation:** Start with free Gemini API key, add others only if needed.

---

## 🎯 Complete Setup Workflow

```powershell
# 1. Install Copilens (if not done)
cd copilens_cli
python -m pip install -e .

# 2. Run setup wizard
copilens config setup

# 3. Follow prompts to get and set Gemini API key

# 4. Verify setup
copilens config show

# 5. Test it!
copilens chat-ai quick "Hello, can you help me with Python?"

# 6. Start chatting
copilens chat-ai interactive
```

---

## 🌟 Features Available with API Key

Once your API key is set, you unlock:

- ✅ **Interactive AI Chat** - Chat with Gemini 3 Pro
- ✅ **Code Analysis** - AI-powered repo insights
- ✅ **Remote Analysis** - Analyze GitHub/GitLab repos
- ✅ **Code Generation** - Generate code from descriptions
- ✅ **AI Detection** - Detect AI-generated code
- ✅ **Security Analysis** - AI security audits
- ✅ **Quick Questions** - One-off AI assistance

All powered by Gemini 3 Pro with:
- 🧠 Deep thinking
- 🔍 Google Search integration
- 💡 Contextual understanding

---

## 📞 Need Help?

```powershell
# Setup wizard
copilens config setup

# Show current config
copilens config show

# Get key instructions
copilens config get-key

# General help
copilens config --help
```

**Support:** atuhaire.com/connect

---

**That's it! You're ready to use all AI features in Copilens.** 🎉

Start with: `copilens chat-ai interactive`
