"""Diff command - Analyze git diff for AI patterns"""
import typer
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.ai_detector import AIDetector
from copilens.ui.output import print_error, print_info, print_panel, console
from rich.table import Table


def diff_command(
    path: str = typer.Option(".", help="Repository path"),
    file: str = typer.Option(None, "--file", "-f", help="Specific file to analyze"),
    staged: bool = typer.Option(False, "--staged", "-s", help="Analyze staged changes")
):
    """Analyze git diff for AI patterns"""
    
    repo_path = Path(path).resolve()
    
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error("Not a Git repository. Run 'copilens init' first.")
        raise typer.Exit(1)
    
    ai_detector = AIDetector()
    
    # Get diffs
    diffs = git_analyzer.get_diff(staged=staged)
    
    if file:
        diffs = [d for d in diffs if file in d.file_path]
    
    if not diffs:
        print_info("No changes detected.")
        return
    
    # Analyze patterns
    for diff in diffs:
        patterns = ai_detector.detect_ai_patterns(diff.diff_content, diff.added_lines)
        ai_percentage = ai_detector.calculate_ai_percentage(diff.diff_content, diff.added_lines)
        
        # Display results
        console.print(f"\n[bold cyan]File:[/bold cyan] {diff.file_path}")
        console.print(f"[green]+{diff.added_lines}[/green] / [red]-{diff.deleted_lines}[/red] lines")
        console.print(f"AI Contribution: [magenta]{int(ai_percentage * 100)}%[/magenta]")
        
        if patterns:
            table = Table(title="AI Patterns Detected", show_header=True)
            table.add_column("Pattern", style="cyan")
            table.add_column("Confidence", justify="right", style="magenta")
            table.add_column("Description")
            
            for pattern in patterns:
                confidence_str = f"{int(pattern.confidence * 100)}%"
                table.add_row(
                    pattern.pattern_type,
                    confidence_str,
                    pattern.description
                )
            
            console.print(table)
        else:
            print_info("No significant AI patterns detected.")
