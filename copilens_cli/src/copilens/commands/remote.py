"""
Remote Repository Analysis Command
Analyze public GitHub/GitLab repositories
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.markdown import Markdown
from typing import Optional
from pathlib import Path

from ..analyzers.remote_analyzer import RemoteRepoAnalyzer
from ..agentic.gemini3_provider import get_gemini3, create_analysis_prompt

console = Console()
app = typer.Typer(invoke_without_command=True)


@app.callback()
def remote_callback(ctx: typer.Context):
    """
    Analyze remote repositories (GitHub/GitLab)
    
    Run 'copilens remote --help' to see available commands.
    """
    if ctx.invoked_subcommand is None:
        console.print("\n[bold cyan]🔍 Remote Repository Analysis[/bold cyan]\n")
        console.print("Analyze any public GitHub, GitLab, or Bitbucket repository!\n")
        
        console.print("[bold]Available Commands:[/bold]")
        console.print("  [green]copilens remote quick <url>[/green]     - Quick scan (no API key needed)")
        console.print("  [green]copilens remote analyze <url>[/green]  - Full AI analysis")
        
        console.print("\n[bold]Example:[/bold]")
        console.print("  copilens remote quick https://github.com/user/repo")
        console.print("  copilens remote analyze https://github.com/user/repo --type security")
        
        console.print("\n[bold yellow]Analysis Types:[/bold yellow]")
        console.print("  • comprehensive (default)")
        console.print("  • security")
        console.print("  • quality")
        console.print("  • architecture")
        
        console.print("\n[dim]Run 'copilens remote --help' for more info[/dim]\n")


@app.command(name="analyze")
def analyze_remote(
    url: str = typer.Argument(..., help="Repository URL (GitHub, GitLab, etc.)"),
    analysis_type: str = typer.Option(
        "comprehensive",
        "--type", "-t",
        help="Analysis type: comprehensive, security, quality, architecture"
    ),
    no_llm: bool = typer.Option(
        False,
        "--no-llm",
        help="Skip LLM analysis (basic stats only)"
    ),
    save: Optional[str] = typer.Option(
        None,
        "--save", "-s",
        help="Save report to file"
    ),
):
    """
    Analyze remote repository with AI-powered insights
    
    Examples:
      copilens remote analyze https://github.com/user/repo
      copilens remote analyze https://gitlab.com/user/repo --type security
      copilens remote analyze github.com/user/repo --save report.md
    """
    console.print("\n[bold cyan]🔍 Remote Repository Analysis[/bold cyan]\n")
    
    # Step 1: Clone and analyze
    console.print(f"[yellow]Repository:[/yellow] {url}")
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console,
        ) as progress:
            
            # Clone repository
            task1 = progress.add_task("Cloning repository...", total=100)
            
            with RemoteRepoAnalyzer(url) as analyzer:
                progress.update(task1, advance=30)
                
                # Get basic analysis
                progress.update(task1, description="Analyzing code...", advance=30)
                analysis = analyzer.analyze(use_llm=False)
                progress.update(task1, advance=40, completed=100)
                
                # Display basic info
                _show_basic_analysis(analysis)
                
                # LLM analysis
                if not no_llm:
                    console.print("\n[bold cyan]🤖 AI-Powered Deep Analysis[/bold cyan]\n")
                    
                    # Check Gemini 3
                    gemini3 = get_gemini3()
                    if not gemini3.is_available():
                        console.print(
                            "[bold red]❌ Gemini 3 not available![/bold red]\n\n"
                            "[yellow]Please set your API key:[/yellow]\n\n"
                            "[cyan]Windows PowerShell:[/cyan]\n"
                            "  $env:GEMINI_API_KEY=\"your-key-here\"\n\n"
                            "[cyan]Windows Command Prompt:[/cyan]\n"
                            "  set GEMINI_API_KEY=your-key-here\n\n"
                            "[cyan]Get free Gemini API key:[/cyan]\n"
                            "  https://makersuite.google.com/app/apikey\n\n"
                            "[dim]Install: pip install google-genai[/dim]"
                        )
                        raise typer.Exit(1)
                    
                    # Get code summary
                    task2 = progress.add_task(
                        "Gathering code context...",
                        total=100
                    )
                    code_summary = analyzer.get_code_summary(max_files=30)
                    progress.update(task2, advance=100)
                    
                    # Create analysis prompt
                    prompt = create_analysis_prompt(
                        code_context=code_summary,
                        repository_url=url,
                        analysis_type=analysis_type
                    )
                    
                    # Run AI analysis
                    console.print("\n[dim]Gemini 3 Pro analyzing (with Google Search & deep thinking)...[/dim]\n")
                    
                    try:
                        response = gemini3.analyze_code(
                            prompt=prompt,
                            use_search=True,
                            thinking_level="HIGH",
                            stream=False
                        )
                        
                        # Display AI analysis
                        console.print(Panel(
                            Markdown(response.content),
                            title=f"[bold green]AI Analysis Report ({analysis_type.title()})[/bold green]",
                            border_style="green"
                        ))
                        
                        # Save report if requested
                        if save:
                            _save_report(analysis, response.content, save)
                            console.print(f"\n[green]✓ Report saved to {save}[/green]")
                    
                    except Exception as e:
                        console.print(f"[red]AI analysis error: {e}[/red]")
                        console.print("[yellow]Showing basic analysis only[/yellow]")
    
    except RuntimeError as e:
        console.print(f"\n[bold red]Error:[/bold red] {e}")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"\n[bold red]Unexpected error:[/bold red] {e}")
        raise typer.Exit(1)


def _show_basic_analysis(analysis: dict):
    """Display basic analysis results"""
    
    # Repository info
    repo = analysis['repository']
    console.print(f"\n[bold]Repository Info[/bold]")
    console.print(f"  Platform: [cyan]{repo['platform']}[/cyan]")
    if repo['owner']:
        console.print(f"  Owner: [cyan]{repo['owner']}[/cyan]")
    if repo['repo_name']:
        console.print(f"  Name: [cyan]{repo['repo_name']}[/cyan]")
    
    # Architecture
    arch = analysis['architecture']
    table = Table(title="Architecture", show_header=True, header_style="bold cyan")
    table.add_column("Property", style="yellow")
    table.add_column("Value", style="white")
    
    table.add_row("Project Type", arch['type'])
    table.add_row("Languages", ", ".join(arch['languages'][:5]))
    table.add_row("Frameworks", ", ".join(arch['frameworks'][:3]) if arch['frameworks'] else "None detected")
    table.add_row("Has Frontend", "✓" if arch['has_frontend'] else "✗")
    table.add_row("Has Backend", "✓" if arch['has_backend'] else "✗")
    table.add_row("Has Database", "✓" if arch['has_database'] else "✗")
    
    console.print(table)
    
    # Code stats
    stats = analysis['analysis']
    table2 = Table(title="Code Statistics", show_header=True, header_style="bold cyan")
    table2.add_column("Metric", style="yellow")
    table2.add_column("Value", style="white")
    
    table2.add_row("Total Files", str(stats['total_files']))
    table2.add_row("Total Lines", f"{stats['total_lines']:,}")
    table2.add_row("Avg File Size", f"{stats['avg_file_size']:.1f} lines")
    table2.add_row("Large Files (>500 lines)", str(stats['large_files']))
    table2.add_row("Quality Score", f"{stats['quality_score']}/100")
    
    if stats['ai_probability'] > 0:
        ai_pct = stats['ai_probability'] * 100
        table2.add_row("AI-Generated Probability", f"{ai_pct:.1f}%")
    
    console.print(table2)


def _save_report(analysis: dict, ai_report: str, filepath: str):
    """Save analysis report to file"""
    repo = analysis['repository']
    arch = analysis['architecture']
    stats = analysis['analysis']
    
    report = f"""# Repository Analysis Report

**Repository:** {repo['url']}
**Platform:** {repo['platform']}
**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## Quick Stats

- **Files:** {stats['total_files']}
- **Lines:** {stats['total_lines']:,}
- **Languages:** {', '.join(arch['languages'][:5])}
- **Quality Score:** {stats['quality_score']}/100

## Architecture

- **Type:** {arch['type']}
- **Frameworks:** {', '.join(arch['frameworks'][:3]) if arch['frameworks'] else 'None'}
- **Frontend:** {'Yes' if arch['has_frontend'] else 'No'}
- **Backend:** {'Yes' if arch['has_backend'] else 'No'}
- **Database:** {'Yes' if arch['has_database'] else 'No'}

---

## AI Analysis

{ai_report}

---

*Generated by Copilens - Track AI, Trust Code*
"""
    
    Path(filepath).write_text(report, encoding='utf-8')


@app.command(name="quick")
def quick_scan(
    url: str = typer.Argument(..., help="Repository URL"),
):
    """
    Quick scan without AI analysis
    
    Example:
      copilens remote quick https://github.com/user/repo
    """
    console.print("\n[bold cyan]⚡ Quick Scan[/bold cyan]\n")
    
    try:
        with RemoteRepoAnalyzer(url) as analyzer:
            analysis = analyzer.analyze(use_llm=False)
            _show_basic_analysis(analysis)
            
            console.print("\n[dim]For detailed AI analysis, use: copilens remote analyze <url>[/dim]")
    
    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] {e}")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
