"""
Configuration Command
Manage API keys and settings
"""

import typer
from rich.console import Console

from ..core.config_manager import get_config

console = Console()
app = typer.Typer(invoke_without_command=True)


@app.callback()
def config_callback(ctx: typer.Context):
    """
    Manage API keys and configuration
    
    Run 'copilens config --help' to see available commands.
    """
    if ctx.invoked_subcommand is None:
        # Show current config when no subcommand given
        config = get_config()
        config.show_config()
        
        console.print("\n[bold cyan]Available Commands:[/bold cyan]")
        console.print("  [green]copilens config setup[/green]    - Interactive setup wizard")
        console.print("  [green]copilens config show[/green]     - Show current configuration")
        console.print("  [green]copilens config set[/green]      - Set API key")
        console.print("  [green]copilens config get-key[/green]  - Get API key instructions")
        console.print("\n[dim]Run 'copilens config --help' for more info[/dim]\n")


@app.command(name="setup")
def setup_wizard():
    """
    Interactive setup wizard
    
    Guides you through setting up API keys for Gemini, OpenAI, and Anthropic.
    """
    config = get_config()
    config.setup_wizard()


@app.command(name="set")
def set_api_key(
    provider: str = typer.Argument(..., help="Provider: gemini, openai, or anthropic"),
    api_key: str = typer.Argument(..., help="Your API key"),
):
    """
    Set API key for a provider
    
    Examples:
      copilens config set gemini YOUR_API_KEY
      copilens config set openai YOUR_API_KEY
    """
    provider = provider.lower()
    valid_providers = ['gemini', 'openai', 'anthropic']
    
    if provider not in valid_providers:
        console.print(f"[red]Invalid provider: {provider}[/red]")
        console.print(f"[yellow]Valid providers: {', '.join(valid_providers)}[/yellow]")
        raise typer.Exit(1)
    
    config = get_config()
    config.set_api_key(provider, api_key)


@app.command(name="show")
def show_config():
    """
    Show current configuration
    
    Displays all configured API keys (masked for security)
    """
    config = get_config()
    config.show_config()


@app.command(name="remove")
def remove_api_key(
    provider: str = typer.Argument(..., help="Provider: gemini, openai, or anthropic"),
):
    """
    Remove API key for a provider
    
    Example:
      copilens config remove gemini
    """
    provider = provider.lower()
    config = get_config()
    config.remove_api_key(provider)


@app.command(name="get-key")
def get_key_instructions():
    """
    Show instructions for getting API keys
    """
    console.print("\n[bold cyan]🔑 How to Get API Keys[/bold cyan]\n")
    
    console.print("[bold]1. Gemini API (Recommended - Free Tier Available)[/bold]")
    console.print("   • Visit: [cyan]https://makersuite.google.com/app/apikey[/cyan]")
    console.print("   • Sign in with Google account")
    console.print("   • Click 'Create API Key'")
    console.print("   • Copy the key")
    console.print("   • Run: [green]copilens config set gemini YOUR_KEY[/green]\n")
    
    console.print("[bold]2. OpenAI API (Optional)[/bold]")
    console.print("   • Visit: [cyan]https://platform.openai.com/api-keys[/cyan]")
    console.print("   • Sign up or log in")
    console.print("   • Create new API key")
    console.print("   • Run: [green]copilens config set openai YOUR_KEY[/green]\n")
    
    console.print("[bold]3. Anthropic API (Optional)[/bold]")
    console.print("   • Visit: [cyan]https://console.anthropic.com/[/cyan]")
    console.print("   • Sign up for account")
    console.print("   • Get API key from settings")
    console.print("   • Run: [green]copilens config set anthropic YOUR_KEY[/green]\n")
    
    console.print("[bold yellow]Quick Setup:[/bold yellow]")
    console.print("  Run: [cyan]copilens config setup[/cyan]\n")


if __name__ == "__main__":
    app()
