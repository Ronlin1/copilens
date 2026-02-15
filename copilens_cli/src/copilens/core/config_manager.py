"""
Configuration Management for Copilens
Handles API keys and settings storage
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from rich.console import Console
from rich.panel import Panel

console = Console()


class CopilensConfig:
    """Manage Copilens configuration"""
    
    def __init__(self):
        self.config_dir = Path.home() / '.copilens'
        self.config_file = self.config_dir / 'config.json'
        self.config_dir.mkdir(exist_ok=True)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}
    
    def _save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            return True
        except Exception as e:
            console.print(f"[red]Error saving config: {e}[/red]")
            return False
    
    def set_api_key(self, provider: str, api_key: str) -> bool:
        """
        Set API key for a provider
        
        Args:
            provider: 'gemini', 'openai', or 'anthropic'
            api_key: The API key
        """
        if 'api_keys' not in self.config:
            self.config['api_keys'] = {}
        
        self.config['api_keys'][provider] = api_key
        
        if self._save_config():
            console.print(f"[green]✓ {provider.upper()} API key saved![/green]")
            console.print(f"[dim]Config file: {self.config_file}[/dim]")
            return True
        return False
    
    def get_api_key(self, provider: str) -> Optional[str]:
        """
        Get API key for a provider
        
        Priority:
        1. Environment variable
        2. Config file
        
        Args:
            provider: 'gemini', 'openai', or 'anthropic'
        """
        # Check environment variable first
        env_var = f"{provider.upper()}_API_KEY"
        env_key = os.getenv(env_var)
        if env_key:
            return env_key
        
        # Check config file
        if 'api_keys' in self.config:
            return self.config['api_keys'].get(provider)
        
        return None
    
    def show_config(self):
        """Display current configuration"""
        providers = ['gemini', 'openai', 'anthropic']
        
        console.print("\n[bold cyan]🔑 API Key Configuration[/bold cyan]\n")
        
        for provider in providers:
            key = self.get_api_key(provider)
            env_var = f"{provider.upper()}_API_KEY"
            
            if key:
                # Mask the key for security
                masked_key = key[:8] + "..." + key[-4:] if len(key) > 12 else "***"
                
                # Check source
                if os.getenv(env_var):
                    source = "[yellow]environment variable[/yellow]"
                else:
                    source = "[cyan]config file[/cyan]"
                
                console.print(f"  ✓ [green]{provider.upper():12}[/green] {masked_key} ({source})")
            else:
                console.print(f"  ✗ [dim]{provider.upper():12} Not set[/dim]")
        
        console.print(f"\n[dim]Config file: {self.config_file}[/dim]")
    
    def remove_api_key(self, provider: str) -> bool:
        """Remove API key for a provider"""
        if 'api_keys' in self.config and provider in self.config['api_keys']:
            del self.config['api_keys'][provider]
            if self._save_config():
                console.print(f"[green]✓ {provider.upper()} API key removed[/green]")
                return True
        else:
            console.print(f"[yellow]No {provider.upper()} API key found[/yellow]")
        return False
    
    def setup_wizard(self):
        """Interactive setup wizard"""
        console.print("\n[bold cyan]🚀 Copilens Setup Wizard[/bold cyan]\n")
        
        console.print(Panel(
            "[bold]Welcome to Copilens![/bold]\n\n"
            "Let's set up your API keys for AI-powered features.\n\n"
            "[yellow]Recommended:[/yellow] Gemini (free tier available)\n"
            "[dim]You can skip any provider and set it up later.[/dim]",
            border_style="cyan"
        ))
        
        # Gemini setup
        console.print("\n[bold cyan]1. Gemini API Key[/bold cyan]")
        console.print("[dim]Get free key: https://makersuite.google.com/app/apikey[/dim]")
        
        current_gemini = self.get_api_key('gemini')
        if current_gemini:
            console.print(f"[yellow]Current key: {current_gemini[:8]}...{current_gemini[-4:]}[/yellow]")
        
        gemini_key = input("\nEnter Gemini API key (or press Enter to skip): ").strip()
        if gemini_key:
            self.set_api_key('gemini', gemini_key)
            # Also set environment variable for current session
            os.environ['GEMINI_API_KEY'] = gemini_key
        
        # Optional: OpenAI
        console.print("\n[bold cyan]2. OpenAI API Key (Optional)[/bold cyan]")
        console.print("[dim]For GPT-4 fallback support[/dim]")
        
        want_openai = input("Set up OpenAI? (y/n): ").strip().lower()
        if want_openai == 'y':
            openai_key = input("Enter OpenAI API key: ").strip()
            if openai_key:
                self.set_api_key('openai', openai_key)
        
        # Optional: Anthropic
        console.print("\n[bold cyan]3. Anthropic API Key (Optional)[/bold cyan]")
        console.print("[dim]For Claude support[/dim]")
        
        want_anthropic = input("Set up Anthropic? (y/n): ").strip().lower()
        if want_anthropic == 'y':
            anthropic_key = input("Enter Anthropic API key: ").strip()
            if anthropic_key:
                self.set_api_key('anthropic', anthropic_key)
        
        # Summary
        console.print("\n[bold green]✓ Setup Complete![/bold green]\n")
        self.show_config()
        
        console.print("\n[bold]Next Steps:[/bold]")
        console.print("  • Try: [cyan]copilens stats --full --llm[/cyan]")
        console.print("  • Try: [cyan]copilens chat[/cyan]")
        console.print("  • Try: [cyan]copilens remote analyze <repo-url>[/cyan]")
        console.print("  • Help: [cyan]copilens config --help[/cyan]\n")


# Singleton instance
_config_instance = None

def get_config() -> CopilensConfig:
    """Get global config instance"""
    global _config_instance
    if _config_instance is None:
        _config_instance = CopilensConfig()
    return _config_instance
