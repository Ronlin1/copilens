"""
LLM Provider Interface for Copilens Agent
Supports: Google Gemini, OpenAI, Anthropic with automatic fallback
"""

from abc import ABC, abstractmethod
from typing import Iterator, List, Dict, Optional, Any
from enum import Enum
import os
from dataclasses import dataclass

# Import config manager
try:
    from copilens.core.config_manager import get_config
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False


class LLMProviderType(Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


@dataclass
class LLMMessage:
    """Represents a chat message"""
    role: str  # "user", "assistant", "system"
    content: str


@dataclass
class LLMResponse:
    """Response from LLM"""
    content: str
    provider: LLMProviderType
    tokens_used: int = 0
    model: str = ""


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key
        self.model = model
        self.available = False
        self._initialize()
    
    @abstractmethod
    def _initialize(self):
        """Initialize the provider"""
        pass
    
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """Generate response from prompt"""
        pass
    
    @abstractmethod
    def chat(self, messages: List[LLMMessage], **kwargs) -> str:
        """Chat with conversation history"""
        pass
    
    @abstractmethod
    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        """Stream response tokens"""
        pass
    
    def is_available(self) -> bool:
        """Check if provider is available"""
        return self.available


class GeminiProvider(LLMProvider):
    """Google Gemini AI Provider"""
    
    def _initialize(self):
        try:
            import google.generativeai as genai
            
            # Check config file first, then environment
            if not self.api_key:
                if CONFIG_AVAILABLE:
                    config = get_config()
                    self.api_key = config.get_api_key('gemini')
                else:
                    self.api_key = os.getenv("GEMINI_API_KEY")
            
            if not self.api_key:
                self.available = False
                return
            
            genai.configure(api_key=self.api_key)
            self.model = self.model or "gemini-2.0-flash-exp"
            self.client = genai.GenerativeModel(self.model)
            self.available = True
            
        except Exception as e:
            self.available = False
    
    def generate(self, prompt: str, **kwargs) -> str:
        if not self.available:
            raise RuntimeError("Gemini provider not available")
        
        try:
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            raise RuntimeError(f"Gemini generation failed: {e}")
    
    def chat(self, messages: List[LLMMessage], **kwargs) -> str:
        if not self.available:
            raise RuntimeError("Gemini provider not available")
        
        try:
            # Convert messages to Gemini format
            chat = self.client.start_chat(history=[])
            
            # Process conversation
            for msg in messages[:-1]:  # All but last
                if msg.role == "user":
                    chat.send_message(msg.content)
            
            # Send final message and get response
            response = chat.send_message(messages[-1].content)
            return response.text
            
        except Exception as e:
            raise RuntimeError(f"Gemini chat failed: {e}")
    
    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        if not self.available:
            raise RuntimeError("Gemini provider not available")
        
        try:
            response = self.client.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            raise RuntimeError(f"Gemini streaming failed: {e}")


class OpenAIProvider(LLMProvider):
    """OpenAI GPT Provider"""
    
    def _initialize(self):
        try:
            from openai import OpenAI
            
            # Check config file first, then environment
            if not self.api_key:
                if CONFIG_AVAILABLE:
                    config = get_config()
                    self.api_key = config.get_api_key('openai')
                else:
                    self.api_key = os.getenv("OPENAI_API_KEY")
            
            if not self.api_key:
                self.available = False
                return
            
            self.client = OpenAI(api_key=self.api_key)
            self.model = self.model or "gpt-4o-mini"
            self.available = True
            
        except Exception:
            self.available = False
    
    def generate(self, prompt: str, **kwargs) -> str:
        if not self.available:
            raise RuntimeError("OpenAI provider not available")
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI generation failed: {e}")
    
    def chat(self, messages: List[LLMMessage], **kwargs) -> str:
        if not self.available:
            raise RuntimeError("OpenAI provider not available")
        
        try:
            openai_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI chat failed: {e}")
    
    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        if not self.available:
            raise RuntimeError("OpenAI provider not available")
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                **kwargs
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise RuntimeError(f"OpenAI streaming failed: {e}")


class AnthropicProvider(LLMProvider):
    """Anthropic Claude Provider"""
    
    def _initialize(self):
        try:
            from anthropic import Anthropic
            
            # Check config file first, then environment
            if not self.api_key:
                if CONFIG_AVAILABLE:
                    config = get_config()
                    self.api_key = config.get_api_key('anthropic')
                else:
                    self.api_key = os.getenv("ANTHROPIC_API_KEY")
            
            if not self.api_key:
                self.available = False
                return
            
            self.client = Anthropic(api_key=self.api_key)
            self.model = self.model or "claude-3-5-sonnet-20241022"
            self.available = True
            
        except Exception:
            self.available = False
    
    def generate(self, prompt: str, **kwargs) -> str:
        if not self.available:
            raise RuntimeError("Anthropic provider not available")
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.content[0].text
        except Exception as e:
            raise RuntimeError(f"Anthropic generation failed: {e}")
    
    def chat(self, messages: List[LLMMessage], **kwargs) -> str:
        if not self.available:
            raise RuntimeError("Anthropic provider not available")
        
        try:
            claude_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in messages
                if msg.role != "system"  # Claude handles system differently
            ]
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=claude_messages,
                **kwargs
            )
            return response.content[0].text
        except Exception as e:
            raise RuntimeError(f"Anthropic chat failed: {e}")
    
    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        if not self.available:
            raise RuntimeError("Anthropic provider not available")
        
        try:
            with self.client.messages.stream(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except Exception as e:
            raise RuntimeError(f"Anthropic streaming failed: {e}")


class MultiProviderLLM:
    """
    Multi-provider LLM with automatic fallback
    Tries: Gemini → OpenAI → Anthropic
    """
    
    def __init__(self):
        self.providers = []
        self.active_provider: Optional[LLMProvider] = None
        
        # Initialize all providers
        gemini = GeminiProvider()
        openai = OpenAIProvider()
        anthropic = AnthropicProvider()
        
        # Add available providers in priority order
        if gemini.is_available():
            self.providers.append(("Gemini", gemini))
        if openai.is_available():
            self.providers.append(("OpenAI", openai))
        if anthropic.is_available():
            self.providers.append(("Anthropic", anthropic))
        
        # Set active provider
        if self.providers:
            self.active_provider = self.providers[0][1]
    
    def is_available(self) -> bool:
        """Check if any provider is available"""
        return len(self.providers) > 0
    
    def get_active_provider_name(self) -> str:
        """Get name of active provider"""
        if not self.active_provider:
            return "None"
        for name, provider in self.providers:
            if provider == self.active_provider:
                return name
        return "Unknown"
    
    def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate with fallback"""
        for name, provider in self.providers:
            try:
                content = provider.generate(prompt, **kwargs)
                return LLMResponse(
                    content=content,
                    provider=LLMProviderType[name.upper()],
                    model=provider.model
                )
            except Exception as e:
                continue
        
        raise RuntimeError("All LLM providers failed")
    
    def chat(self, messages: List[LLMMessage], **kwargs) -> LLMResponse:
        """Chat with fallback"""
        for name, provider in self.providers:
            try:
                content = provider.chat(messages, **kwargs)
                return LLMResponse(
                    content=content,
                    provider=LLMProviderType[name.upper()],
                    model=provider.model
                )
            except Exception:
                continue
        
        raise RuntimeError("All LLM providers failed")
    
    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        """Stream with fallback"""
        for name, provider in self.providers:
            try:
                yield from provider.stream(prompt, **kwargs)
                return
            except Exception:
                continue
        
        raise RuntimeError("All LLM providers failed")
    
    def list_available_providers(self) -> List[str]:
        """List all available providers"""
        return [name for name, _ in self.providers]


# Global LLM instance
_llm_instance: Optional[MultiProviderLLM] = None


def get_llm() -> MultiProviderLLM:
    """Get global LLM instance (singleton)"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = MultiProviderLLM()
    return _llm_instance
