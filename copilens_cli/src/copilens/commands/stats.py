"""Stats command - Display AI contribution statistics"""
import typer
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.enhanced_ai_detector import EnhancedAIDetector
from copilens.analyzers.complexity import ComplexityAnalyzer
from copilens.analyzers.risk import RiskAnalyzer
from copilens.analyzers.metrics import MetricsEngine, FileMetrics
from copilens.analyzers.repo_analyzer import RepositoryAnalyzer
from copilens.ui.dashboard import Dashboard
from copilens.ui.output import print_error, print_info, print_warning, console
from rich.panel import Panel
from rich.table import Table
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn


def stats_command(
    path: str = typer.Option(".", help="Repository path"),
    staged: bool = typer.Option(False, "--staged", "-s", help="Analyze staged changes only"),
    full: bool = typer.Option(False, "--full", "-f", help="Full repository analysis (no git changes required)"),
    llm: bool = typer.Option(True, "--llm/--no-llm", help="Use LLM for intelligent analysis")
):
    """
    Display AI contribution statistics
    
    Modes:
    - Default: Analyze git changes (requires uncommitted changes)
    - --full: Analyze entire repository (works without changes)
    - --llm: Include AI-powered insights (requires API key)
    """
    
    repo_path = Path(path).resolve()
    
    # Full repository analysis mode
    if full:
        _show_full_repo_stats(repo_path, use_llm=llm)
        return
    
    # Git diff analysis mode (original behavior)
    _show_git_diff_stats(repo_path, staged)


def _show_full_repo_stats(repo_path: Path, use_llm: bool = True):
    """Show full repository statistics"""
    
    console.print("\n[bold cyan]📊 Full Repository Analysis[/bold cyan]\n")
    
    # Check if LLM available
    if use_llm:
        from copilens.agentic.llm_provider import get_llm
        llm_instance = get_llm()
        if not llm_instance.is_available():
            console.print("[yellow]⚠️  No LLM provider available - skipping AI insights[/yellow]")
            console.print("[dim]Set GEMINI_API_KEY for intelligent analysis[/dim]\n")
            use_llm = False
    
    # Analyze repository
    analyzer = RepositoryAnalyzer(str(repo_path))
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Scanning repository...", total=None)
        stats = analyzer.analyze(use_llm=use_llm)
        progress.update(task, completed=True)
    
    # Display overview
    overview_table = Table(
        title="Repository Overview",
        show_header=True,
        header_style="bold cyan",
        box=box.ROUNDED
    )
    overview_table.add_column("Metric", style="cyan")
    overview_table.add_column("Value", style="white")
    
    overview_table.add_row("Total Files", f"{stats.total_files:,}")
    overview_table.add_row("Total Lines", f"{stats.total_lines:,}")
    overview_table.add_row("Complexity", stats.complexity_estimate)
    overview_table.add_row("Quality Score", f"{stats.code_quality_score:.1f}/100")
    
    console.print(overview_table)
    console.print()
    
    # Language breakdown
    if stats.languages:
        lang_table = Table(
            title="Language Breakdown",
            show_header=True,
            header_style="bold green",
            box=box.ROUNDED
        )
        lang_table.add_column("Language", style="green")
        lang_table.add_column("Lines", style="white", justify="right")
        lang_table.add_column("Percentage", style="cyan", justify="right")
        
        total_lang_lines = sum(stats.languages.values())
        for lang, lines in sorted(stats.languages.items(), key=lambda x: x[1], reverse=True):
            percentage = (lines / total_lang_lines) * 100
            lang_table.add_row(
                lang,
                f"{lines:,}",
                f"{percentage:.1f}%"
            )
        
        console.print(lang_table)
        console.print()
    
    # Largest files
    if stats.largest_files:
        files_table = Table(
            title="Largest Files (Top 10)",
            show_header=True,
            header_style="bold yellow",
            box=box.ROUNDED
        )
        files_table.add_column("File", style="yellow")
        files_table.add_column("Lines", style="white", justify="right")
        
        for file_path, lines in stats.largest_files[:10]:
            files_table.add_row(file_path, f"{lines:,}")
        
        console.print(files_table)
        console.print()
    
    # Potential AI-generated files
    if stats.potential_ai_files:
        console.print(f"[bold magenta]🤖 Potential AI-Generated Files ({len(stats.potential_ai_files)}):[/bold magenta]")
        for i, file in enumerate(stats.potential_ai_files[:10], 1):
            console.print(f"  {i}. [dim]{file}[/dim]")
        if len(stats.potential_ai_files) > 10:
            console.print(f"  [dim]... and {len(stats.potential_ai_files) - 10} more[/dim]")
        console.print()
    
    # AI Analysis (if available)
    if stats.ai_analysis:
        console.print(Panel(
            stats.ai_analysis,
            title="[bold cyan]🧠 AI-Powered Insights[/bold cyan]",
            border_style="cyan",
            box=box.ROUNDED
        ))
        console.print()
    
    # Tips
    console.print(Panel(
        "[yellow]💡 Tip:[/yellow] Use [cyan]copilens stats[/cyan] (without --full) to analyze uncommitted changes\n"
        "[yellow]💡 Tip:[/yellow] Use [cyan]copilens detect-arch[/cyan] for detailed architecture analysis\n"
        "[yellow]💡 Tip:[/yellow] Use [cyan]copilens deploy --auto[/cyan] to deploy this repository",
        title="[bold blue]What's Next?[/bold blue]",
        border_style="blue",
        box=box.ROUNDED
    ))
    console.print()


def _show_git_diff_stats(repo_path: Path, staged: bool = False):
    """Show git diff statistics (original behavior)"""
    
    # Initialize analyzers
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error("Not a Git repository. Run 'copilens init' first.")
        console.print("\n[cyan]💡 Tip: Use [bold]copilens stats --full[/bold] to analyze without git[/cyan]\n")
        raise typer.Exit(1)
    
    ai_detector = EnhancedAIDetector()
    complexity_analyzer = ComplexityAnalyzer()
    risk_analyzer = RiskAnalyzer()
    metrics_engine = MetricsEngine()
    
    # Get diffs
    diffs = git_analyzer.get_diff(staged=staged)
    
    if not diffs:
        print_info("No changes detected.")
        console.print("\n[cyan]💡 Tip: Use [bold]copilens stats --full[/bold] to analyze entire repository[/cyan]\n")
        return
    
    # Show disclaimer for small changes
    total_lines = sum(d.added_lines for d in diffs)
    if total_lines < 20:
        print_warning("Small change detected - AI detection may be less accurate")
    
    # Analyze each file
    for diff in diffs:
        # AI detection
        ai_result = ai_detector.calculate_ai_percentage(
            diff.diff_content,
            diff.added_lines,
            diff.file_path
        )
        ai_percentage = ai_result.ai_percentage
        
        # Complexity (simplified for diff)
        complexity_delta = diff.added_lines // 10  # Rough estimate
        
        # Risk assessment
        risk_score = risk_analyzer.calculate_risk(
            ai_percentage=ai_percentage,
            complexity_delta=complexity_delta,
            added_lines=diff.added_lines,
            file_path=diff.file_path,
            has_tests=False  # TODO: Implement test detection
        )
        
        # Add to metrics
        metrics_engine.add_file_metrics(FileMetrics(
            file_path=diff.file_path,
            ai_percentage=ai_percentage,
            added_lines=diff.added_lines,
            deleted_lines=diff.deleted_lines,
            complexity=complexity_delta,
            risk_score=risk_score.total_score,
            risk_level=risk_score.level
        ))
    
    # Display dashboard
    dashboard = Dashboard()
    aggregate = metrics_engine.calculate_aggregate()
    
    dashboard.show_summary(aggregate)
    print_info("")
    dashboard.show_file_breakdown(metrics_engine.file_metrics)
    
    # Show confidence disclaimer
    console.print("\n[dim]Note: AI detection is probabilistic. See AI_DETECTION_ALGORITHM.md for details.[/dim]")
    console.print("\n[cyan]💡 Tip: Use [bold]copilens stats --full --llm[/bold] for AI-powered repository insights[/cyan]\n")
