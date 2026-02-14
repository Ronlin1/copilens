"""Risk command - Display risk analysis"""
import typer
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.ai_detector import AIDetector
from copilens.analyzers.risk import RiskAnalyzer
from copilens.ui.output import print_error, print_info, print_warning, console
from rich.table import Table
from rich.panel import Panel


def risk_command(
    path: str = typer.Option(".", help="Repository path"),
    threshold: float = typer.Option(3.0, help="Risk threshold (0-5)"),
    staged: bool = typer.Option(False, "--staged", "-s", help="Analyze staged changes")
):
    """Analyze risk in code changes"""
    
    repo_path = Path(path).resolve()
    
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error("Not a Git repository. Run 'copilens init' first.")
        raise typer.Exit(1)
    
    ai_detector = AIDetector()
    risk_analyzer = RiskAnalyzer()
    
    # Get diffs
    diffs = git_analyzer.get_diff(staged=staged)
    
    if not diffs:
        print_info("No changes detected.")
        return
    
    high_risk_files = []
    
    # Analyze each file
    for diff in diffs:
        ai_percentage = ai_detector.calculate_ai_percentage(diff.diff_content, diff.added_lines)
        complexity_delta = diff.added_lines // 10
        
        risk_score = risk_analyzer.calculate_risk(
            ai_percentage=ai_percentage,
            complexity_delta=complexity_delta,
            added_lines=diff.added_lines,
            file_path=diff.file_path,
            has_tests=False
        )
        
        if risk_score.total_score >= threshold:
            high_risk_files.append((diff.file_path, risk_score))
    
    # Display results
    if high_risk_files:
        console.print(f"\n[red bold]⚠ {len(high_risk_files)} high-risk file(s) detected![/red bold]\n")
        
        for file_path, risk_score in high_risk_files:
            risk_color = "red" if risk_score.total_score >= 4 else "yellow"
            console.print(f"[bold]{file_path}[/bold]")
            console.print(f"Risk Score: [{risk_color}]{risk_score.total_score}/5 ({risk_score.level.upper()})[/{risk_color}]\n")
            
            # Show risk factors
            table = Table(show_header=True, box=None)
            table.add_column("Risk Factor", style="cyan")
            table.add_column("Score", justify="right")
            table.add_column("Description")
            
            for factor in risk_score.factors:
                severity_style = {
                    "low": "green",
                    "medium": "yellow",
                    "high": "red",
                    "critical": "red bold"
                }.get(factor.severity, "white")
                
                table.add_row(
                    factor.name,
                    f"[{severity_style}]{factor.score}/5[/{severity_style}]",
                    factor.description
                )
            
            console.print(table)
            console.print()
    else:
        console.print("[green]✓ No high-risk changes detected.[/green]")
        print_info(f"All changes are below the risk threshold of {threshold}/5")
