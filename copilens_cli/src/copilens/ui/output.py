"""Terminal output utilities"""
from rich.console import Console
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.panel import Panel


console = Console()


def print_success(message: str) -> None:
    """Print success message"""
    console.print(f"[green]✓[/green] {message}")


def print_error(message: str) -> None:
    """Print error message"""
    console.print(f"[red]✗[/red] {message}", style="red")


def print_warning(message: str) -> None:
    """Print warning message"""
    console.print(f"[yellow]⚠[/yellow] {message}", style="yellow")


def print_info(message: str) -> None:
    """Print info message"""
    console.print(f"[blue]ℹ[/blue] {message}")


def print_code(code: str, language: str = "python") -> None:
    """Print syntax-highlighted code"""
    syntax = Syntax(code, language, theme="monokai", line_numbers=True)
    console.print(syntax)


def print_markdown(content: str) -> None:
    """Print formatted markdown"""
    md = Markdown(content)
    console.print(md)


def print_panel(content: str, title: str = "", style: str = "blue") -> None:
    """Print content in a panel"""
    panel = Panel(content, title=title, border_style=style)
    console.print(panel)
