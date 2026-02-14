# Copilens AI Integration Guide

## Overview

Copilens uses advanced LLMs for code generation, analysis, and autonomous decision-making. It supports multiple AI providers with automatic fallback.

## Supported AI Providers

### 1. Google Gemini (Recommended)
- **Model**: Gemini 2.0 Flash
- **Free Tier**: ✅ Available
- **Speed**: Very Fast
- **Setup**:
  ```bash
  export GEMINI_API_KEY="your-api-key-here"
  ```
- **Get API Key**: https://makersuite.google.com/app/apikey

### 2. OpenAI
- **Model**: GPT-4o Mini
- **Free Tier**: ❌ Paid only
- **Speed**: Fast
- **Setup**:
  ```bash
  export OPENAI_API_KEY="your-api-key-here"
  ```
- **Get API Key**: https://platform.openai.com/api-keys

### 3. Anthropic Claude
- **Model**: Claude 3.5 Sonnet
- **Free Tier**: ❌ Paid only
- **Speed**: Fast
- **Setup**:
  ```bash
  export ANTHROPIC_API_KEY="your-api-key-here"
  ```
- **Get API Key**: https://console.anthropic.com/

## Automatic Fallback

Copilens automatically tries providers in this order:
1. Gemini (if API key set)
2. OpenAI (if API key set)
3. Anthropic (if API key set)

If one fails, it automatically tries the next.

## Features Using AI

### 1. Code Generation
```bash
# Generate code from natural language
copilens generate "REST API for user management" --language python

# Generate with specific framework
copilens generate "React component for login" --framework react --output Login.tsx

# Interactive refinement
copilens generate "Python data processor" --interactive
```

**How it works:**
- Sends your description to the LLM
- Gets back production-ready code
- Includes comments, error handling, type hints
- Follows modern best practices

### 2. Autonomous Agent Reasoning
```bash
# Agent uses LLM to reason about actions
copilens agent deploy-app --auto
```

**How it works:**
- Agent observes current state
- Uses LLM to think/reason about next steps
- Plans multi-step actions
- Learns from results

### 3. Code Chat (Already integrated)
```bash
copilens chat
```

## Configuration

### Setting API Keys

**Linux/Mac:**
```bash
# Temporary (current session)
export GEMINI_API_KEY="your-key"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export GEMINI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

**Windows (PowerShell):**
```powershell
# Temporary (current session)
$env:GEMINI_API_KEY="your-key"

# Permanent (user level)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-key', 'User')
```

### Checking Active Provider

```python
from copilens.agentic.llm_provider import get_llm

llm = get_llm()
print(f"Active provider: {llm.get_active_provider_name()}")
print(f"Available providers: {llm.list_available_providers()}")
```

## Best Practices

### 1. Use Gemini for Cost Efficiency
- Gemini 2.0 Flash has generous free tier
- Perfect for prototyping and development
- Fast enough for real-time generation

### 2. Detailed Prompts Get Better Results
```bash
# ❌ Vague
copilens generate "make a website"

# ✅ Specific
copilens generate "React landing page with hero section, features grid, and contact form using Tailwind CSS"
```

### 3. Specify Language and Framework
```bash
copilens generate "user authentication" --language typescript --framework nextjs
```

### 4. Use Interactive Mode for Refinement
```bash
copilens generate "data visualization" --interactive
# Then iteratively refine the output
```

## API Usage Limits

### Gemini Free Tier
- **Rate Limit**: 60 requests/minute
- **Daily Limit**: Generous (check current limits)
- **Token Limit**: 32K context window
- **Cost**: FREE

### OpenAI (if using GPT-4o Mini)
- **Cost**: ~$0.15/1M input tokens
- **Rate Limit**: Varies by tier
- **Context**: 128K tokens

### Anthropic (if using Claude)
- **Cost**: ~$3/1M input tokens
- **Rate Limit**: Varies by tier
- **Context**: 200K tokens

## Troubleshooting

### "No LLM provider available"
**Solution**: Set at least one API key
```bash
export GEMINI_API_KEY="your-key"
```

### "Provider failed"
**Solution**: Check API key is valid and has credits/quota
```bash
# Test provider manually
python -c "from copilens.agentic.llm_provider import GeminiProvider; print(GeminiProvider().is_available())"
```

### Rate limit errors
**Solution**: 
1. Wait a few seconds between requests
2. Use a different provider
3. Upgrade to paid tier

## Example Workflows

### 1. Generate Full Feature
```bash
# Generate backend API
copilens generate "FastAPI CRUD endpoints for blog posts with SQLAlchemy" \
  --language python --output backend/api.py

# Generate frontend component
copilens generate "React blog post list with pagination" \
  --language typescript --output frontend/BlogList.tsx
```

### 2. Modernize Legacy Code
```bash
# (Coming soon)
copilens transform legacy --from python2 --to python3
```

### 3. Autonomous Development
```bash
# Agent uses LLM to reason and decide
export GEMINI_API_KEY="your-key"
copilens agent generate-feature "user authentication system" --auto
```

## Privacy & Security

- **API calls**: Sent to selected provider (Google/OpenAI/Anthropic)
- **Your code**: Only included in prompts when explicitly requested
- **No storage**: Prompts are not stored by Copilens locally
- **Provider policies**: Subject to provider's privacy policy

**Recommendation**: Use .env files and never commit API keys to Git.

## Advanced Usage

### Programmatic Access

```python
from copilens.agentic.llm_provider import get_llm, LLMMessage

# Get LLM instance
llm = get_llm()

# Simple generation
response = llm.generate("Write a Python function to sort a list")
print(response.content)

# Chat with context
messages = [
    LLMMessage(role="user", content="What is FastAPI?"),
    LLMMessage(role="assistant", content="FastAPI is a modern Python web framework..."),
    LLMMessage(role="user", content="Show me an example")
]
response = llm.chat(messages)
print(response.content)

# Streaming
for chunk in llm.stream("Explain async/await"):
    print(chunk, end='')
```

## Coming Soon

- [x] Multi-provider fallback
- [x] Code generation
- [ ] Context-aware code completion
- [ ] Project-specific fine-tuning
- [ ] Local model support (Ollama)
- [ ] Custom model configuration

## Support

Questions? Reach out to **atuhaire.com/connect**
