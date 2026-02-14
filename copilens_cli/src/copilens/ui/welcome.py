"""Welcome screen UI for Copilens CLI"""
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.columns import Columns
from rich.text import Text
from rich import box

console = Console()


def show_welcome():
    """Display welcome screen with ASCII art and quick help"""
    
    # ASCII Art Logo
    logo = """
    ╔═════════════════════════════════════════════════════════════════════╗
    ║                                                                     ║
    ║   ██████╗ ██████╗ ██████╗ ██╗██╗     ███████╗███╗   ██╗███████╗   ║
    ║  ██╔════╝██╔═══██╗██╔══██╗██║██║     ██╔════╝████╗  ██║██╔════╝   ║
    ║  ██║     ██║   ██║██████╔╝██║██║     █████╗  ██╔██╗ ██║███████╗   ║
    ║  ██║     ██║   ██║██╔═══╝ ██║██║     ██╔══╝  ██║╚██╗██║╚════██║   ║
    ║  ╚██████╗╚██████╔╝██║     ██║███████╗███████╗██║ ╚████║███████║   ║
    ║   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝   ║
    ║                                                                     ║
    ║                    Track AI, Trust Code                             ║
    ╚═════════════════════════════════════════════════════════════════════╝
    """
    
    console.print(logo, style="bold cyan", justify="center")
    console.print()
    
    # What it does
    description = Panel(
        "[bold white]Full-Stack Autonomous Agent: Track AI, Generate Code, Deploy & Monitor[/bold white]\n\n"
        "[cyan]🤖 AI Analysis[/cyan]\n"
        "  [green]✓[/green] Track AI-generated code\n"
        "  [green]✓[/green] Complexity & risk analysis\n\n"
        "[cyan]✨ Code Generation[/cyan]\n"
        "  [green]✓[/green] Generate code from description\n"
        "  [green]✓[/green] LLM-powered (Gemini/GPT/Claude)\n\n"
        "[cyan]🚀 Deployment[/cyan]\n"
        "  [green]✓[/green] Auto-deploy to cloud platforms\n"
        "  [green]✓[/green] Vercel, Railway, Netlify, etc.\n\n"
        "[cyan]📊 Monitoring[/cyan]\n"
        "  [green]✓[/green] 24/7 uptime monitoring\n"
        "  [green]✓[/green] Real-time alerts",
        title="[bold magenta]What is Copilens?[/bold magenta]",
        border_style="magenta",
        box=box.ROUNDED
    )
    console.print(description)
    console.print()
    
    # Quick Commands Table
    commands_table = Table(
        title="[bold yellow]⚡ Quick Commands[/bold yellow]",
        show_header=True,
        header_style="bold cyan",
        border_style="yellow",
        box=box.ROUNDED
    )
    commands_table.add_column("Command", style="cyan", width=25)
    commands_table.add_column("Description", style="white")
    
    # Core commands
    commands_table.add_row("copilens init", "[dim]Initialize in Git repo[/dim]")
    commands_table.add_row("copilens stats", "[dim]View AI contribution stats[/dim]")
    
    # NEW: Code Generation
    commands_table.add_row(
        "copilens generate <desc>",
        "[bold green]Generate code with AI[/bold green]"
    )
    
    # NEW: Deployment
    commands_table.add_row(
        "copilens deploy --auto",
        "[bold green]Deploy to cloud (auto)[/bold green]"
    )
    commands_table.add_row("copilens detect-arch", "[dim]Detect project architecture[/dim]")
    
    # NEW: Monitoring
    commands_table.add_row(
        "copilens monitor start <url>",
        "[bold green]Monitor deployed app[/bold green]"
    )
    
    # NEW: Remote Analysis
    commands_table.add_row(
        "copilens remote analyze <url>",
        "[bold cyan]Analyze GitHub/GitLab repos[/bold cyan]"
    )
    
    # Agentic
    commands_table.add_row(
        "copilens agent deploy-app",
        "[bold magenta]Full autonomous deployment[/bold magenta]"
    )
    
    console.print(commands_table)
    console.print()
    
    # Getting Started
    getting_started = Panel(
        "[bold white]Quick Start:[/bold white]\n\n"
        "[cyan]1. Setup:[/cyan] [dim]copilens config setup[/dim] [bold green](Get free API key!)[/bold green]\n"
        "[cyan]2. Chat:[/cyan] [dim]copilens chat-ai interactive[/dim]\n"
        "[cyan]3. Analyze:[/cyan] [dim]copilens remote analyze <github-url>[/dim]\n"
        "[cyan]4. Deploy:[/cyan] [dim]copilens deploy deploy --auto[/dim]\n\n"
        "[bold yellow]💡 New: Interactive AI Chat![/bold yellow]\n"
        "[dim]Talk to Gemini 3 Pro about your code[/dim]\n\n"
        "[dim]For detailed help: [cyan]copilens <command> --help[/cyan][/dim]",
        title="[bold green]🚀 Getting Started[/bold green]",
        border_style="green",
        box=box.ROUNDED
    )
    console.print(getting_started)
    console.print()
    
    # Pro Tips
    tips = Panel(
        "[yellow]💡[/yellow] Set API key: [cyan]copilens config setup[/cyan] [green](recommended)[/green]\n"
        "[yellow]💡[/yellow] Chat with AI: [cyan]copilens chat-ai interactive[/cyan]\n"
        "[yellow]💡[/yellow] Analyze repos: [cyan]copilens remote analyze <url>[/cyan]\n"
        "[yellow]💡[/yellow] Full autonomy: [cyan]copilens agent deploy-app --auto[/cyan]",
        title="[bold blue]Pro Tips[/bold blue]",
        border_style="blue",
        box=box.ROUNDED
    )
    console.print(tips)
    console.print()
    
    # Footer
    footer_text = Text()
    footer_text.append("Help: ", style="dim")
    footer_text.append("copilens --help", style="bold cyan")
    footer_text.append(" | Docs: ", style="dim")
    footer_text.append("QUICKSTART.md", style="bold green")
    footer_text.append("\nFor more info - reach out to ", style="dim")
    footer_text.append("atuhaire.com/connect", style="bold magenta underline")
    
    console.print(Panel(footer_text, border_style="dim", box=box.ROUNDED))
    console.print()
