# Interactive AI Chat & Easy API Key Setup - Complete! ✅

## What's New

### 1. 🔑 Super Simple API Key Management

**New Commands:**
```powershell
copilens config setup      # Interactive setup wizard
copilens config set        # Set API key
copilens config show       # Show current keys
copilens config remove     # Remove API key
copilens config get-key    # Get instructions
```

**Where API Keys Are Stored:**
```
~/.copilens/config.json
```

**No more environment variables needed!** Set once, use forever.

---

### 2. 💬 Interactive AI Chat with Gemini 3 Pro

**New Commands:**
```powershell
copilens chat-ai interactive           # Start interactive chat
copilens chat-ai interactive --analyze # Chat with repo context
copilens chat-ai quick "question"      # Quick one-off question
```

**Features:**
- 🧠 **Deep Thinking** - HIGH-level reasoning
- 🔍 **Google Search** - Real-time context
- 💬 **Conversation History** - Remembers context
- 📁 **Repository Context** - Understands your code
- ⚡ **Streaming Responses** - See answers as they're generated

---

## Quick Start (2 Minutes)

### Step 1: Setup API Key

```powershell
copilens config setup
```

This wizard will:
1. Guide you to get a **free** Gemini API key
2. Save it securely in `~/.copilens/config.json`  
3. Make it available for all commands

### Step 2: Start Chatting!

```powershell
copilens chat-ai interactive
```

That's it! You're now chatting with Gemini 3 Pro.

---

## Interactive Chat Demo

```powershell
$ copilens chat-ai interactive

╭─────────────────────────────────────────╮
│    Welcome to Copilens AI Chat!         │
│                                          │
│ Powered by Gemini 3 Pro with:           │
│   🧠 Deep thinking (HIGH level)          │
│   🔍 Google Search integration           │
│   💬 Conversation history                │
│                                          │
│ Commands: /exit, /clear, /help          │
╰─────────────────────────────────────────╯

You> What are best practices for Python error handling?

AI Assistant>
# Python Error Handling Best Practices

1. **Use Specific Exceptions**
   ```python
   try:
       user = get_user(id)
   except UserNotFound:  # Specific
       handle_missing_user()
   ```

2. **Avoid Bare Except**
   ```python
   # Bad
   try:
       risky_operation()
   except:  # Too broad
       pass
   
   # Good
   try:
       risky_operation()
   except (ValueError, TypeError) as e:
       logger.error(f"Error: {e}")
   ```

3. **Use Context Managers**
   ```python
   with open('file.txt') as f:
       data = f.read()
   # File automatically closed
   ```

...

You> /exit
Goodbye! 👋
```

---

## Chat Commands

Inside the interactive chat:

- **`/exit` or `/quit`** - Exit chat
- **`/clear`** - Clear conversation history
- **`/help`** - Show help

---

## API Key Setup Methods

### Method 1: Setup Wizard (Recommended) ⭐

```powershell
copilens config setup
```

**Pros:**
- ✅ Interactive and guided
- ✅ Helps you get free API key
- ✅ Sets everything up automatically

### Method 2: Direct Set

```powershell
copilens config set gemini YOUR_API_KEY_HERE
```

**Example:**
```powershell
copilens config set gemini AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

### Method 3: Environment Variable (Still Works)

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
```

**Note:** Config file takes precedence if both are set.

---

## Verify Your Setup

```powershell
copilens config show
```

**Output:**
```
🔑 API Key Configuration

  ✓ GEMINI      AIzaSyD1...wxyz (config file)
  ✗ OPENAI      Not set
  ✗ ANTHROPIC   Not set

Config file: C:\Users\YourName\.copilens\config.json
```

---

## Features Unlocked with API Key

Once you set up your API key, these features work:

### 1. Interactive Chat
```powershell
copilens chat-ai interactive
```
Chat about code, get explanations, ask for help.

### 2. Chat with Repository Context
```powershell
copilens chat-ai interactive --analyze
```
AI understands your codebase and can answer specific questions.

### 3. Quick Questions
```powershell
copilens chat-ai quick "Explain async/await in Python"
```
One-off questions without entering chat mode.

### 4. Repository Analysis
```powershell
copilens stats --full --llm
```
AI-powered insights about your code quality.

### 5. Remote Repository Analysis
```powershell
copilens remote analyze https://github.com/user/repo
```
Analyze any public repository with AI.

### 6. Code Generation
```powershell
copilens generate generate "REST API for users"
```
Generate code from natural language.

---

## Example Chat Sessions

### Session 1: Code Review

```
You> Can you review this function?

def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

AI> Here's my review:

**Good:**
- Clear function name
- Simple logic

**Suggestions:**
1. Use list comprehension for better performance
2. Add type hints
3. Add docstring

**Improved version:**
```python
def process_data(data: list[int]) -> list[int]:
    """Double positive values in data."""
    return [item * 2 for item in data if item > 0]
```

This is:
- More Pythonic
- Faster
- More readable
```

### Session 2: Architecture Help

```
You> I'm building a microservices app. What's the best way to handle auth?

AI> For microservices authentication, here are the best approaches:

1. **JWT (JSON Web Tokens)** - Most common ✅
   - Stateless authentication
   - Can include user claims
   - Works across services
   
   Example:
   ```python
   from jose import jwt
   
   token = jwt.encode(
       {"user_id": 123, "role": "admin"},
       secret_key,
       algorithm="HS256"
   )
   ```

2. **OAuth 2.0 + JWT** - Enterprise standard
   - Central auth service
   - Each service validates tokens
   - Use Auth0, Keycloak, or custom

3. **API Gateway Pattern**
   - Gateway handles auth
   - Services trust gateway
   - Simpler service code

**Recommendation:**
Start with JWT for simplicity, move to OAuth 2.0 as you scale.

Need help implementing? I can provide code examples!
```

### Session 3: Debugging

```
You> I'm getting "TypeError: 'NoneType' object is not iterable" - what does this mean?

AI> This error means you're trying to loop over `None` instead of a list/iterable.

**Common causes:**
1. Function returns None instead of list
2. Variable not initialized
3. API call failed silently

**Example:**
```python
# Bad
data = get_data()  # Returns None on error
for item in data:  # Error here!
    process(item)

# Good
data = get_data()
if data is not None:
    for item in data:
        process(item)
```

**Better:**
```python
data = get_data() or []  # Default to empty list
for item in data:
    process(item)
```

Can you share the code where this happens?
```

---

## Configuration File Details

**Location:**
```
Windows: C:\Users\YourName\.copilens\config.json
Mac/Linux: ~/.copilens/config.json
```

**Structure:**
```json
{
  "api_keys": {
    "gemini": "AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz",
    "openai": "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz",
    "anthropic": "sk-ant-1234567890abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Security:**
- ✅ Local file (not shared)
- ✅ Used automatically
- ✅ Can be version-controlled with .gitignore
- ⚠️ Keep private (don't share or commit)

---

## Pro Tips

### 1. Use Chat for Learning

```powershell
copilens chat-ai interactive
```

Ask about:
- Design patterns
- Best practices
- Language features
- Framework usage
- Debugging help

### 2. Analyze Before Chatting

```powershell
copilens chat-ai interactive --analyze
```

AI will understand your specific codebase!

### 3. Quick Questions

```powershell
copilens chat-ai quick "What's the difference between async and sync?"
```

No need to enter chat mode for one-off questions.

### 4. Save Conversations

Chat history is kept in memory during session. For permanent records, copy important responses to your documentation.

---

## Troubleshooting

### "No Gemini API key found"

**Solution:**
```powershell
copilens config setup
```

### "Invalid API key"

1. Check current key:
```powershell
copilens config show
```

2. Get new key from: https://makersuite.google.com/app/apikey

3. Update:
```powershell
copilens config set gemini NEW_KEY
```

### Chat Not Responding

1. Check internet connection
2. Verify API key is set:
```powershell
copilens config show
```

3. Try quick test:
```powershell
copilens chat-ai quick "test"
```

### Config File Not Created

The file is created automatically when you run:
```powershell
copilens config set gemini YOUR_KEY
```

or

```powershell
copilens config setup
```

---

## What Makes This Special?

### Gemini 3 Pro Features

1. **Deep Thinking (HIGH level)**
   - Reasons about complex problems
   - Provides well-thought-out answers
   - Considers multiple approaches

2. **Google Search Integration**
   - Looks up current best practices
   - Finds recent documentation
   - Checks latest framework versions

3. **Conversation Memory**
   - Remembers previous messages
   - Maintains context
   - Builds on earlier discussions

4. **Repository Awareness** (with --analyze)
   - Understands your code structure
   - Knows your tech stack
   - Gives project-specific advice

---

## Complete Setup Workflow

```powershell
# 1. Install dependencies (if needed)
cd copilens_cli
python -m pip install google-genai

# 2. Run setup wizard
copilens config setup

# 3. Follow prompts to get free Gemini API key

# 4. Verify setup
copilens config show

# 5. Start chatting!
copilens chat-ai interactive

# Or quick question
copilens chat-ai quick "Hello!"

# Or with repo context
copilens chat-ai interactive --analyze
```

---

## Summary

✅ **Easy API Key Setup** - One command sets everything
✅ **Saved Permanently** - No environment variables needed
✅ **Interactive Chat** - Talk to Gemini 3 Pro
✅ **Deep Thinking** - HIGH-level reasoning
✅ **Google Search** - Real-time context
✅ **Repository Context** - Understands your code
✅ **Free Tier** - Get started with free Gemini API

---

## Next Steps

1. **Set up API key:**
```powershell
copilens config setup
```

2. **Start chatting:**
```powershell
copilens chat-ai interactive
```

3. **Ask anything about code!**

---

**Enjoy your new AI coding assistant!** 🎉

*Track AI, Trust Code* - atuhaire.com/connect
