"""Export command - Export analysis reports"""
import typer
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.ai_detector import AIDetector
from copilens.analyzers.metrics import MetricsEngine, FileMetrics
from copilens.analyzers.risk import RiskAnalyzer
from copilens.ui.output import print_success, print_error, print_info


def export_command(
    output: str = typer.Argument(..., help="Output file path"),
    format: str = typer.Option("json", help="Export format (json, csv)"),
    path: str = typer.Option(".", help="Repository path"),
    staged: bool = typer.Option(False, "--staged", "-s", help="Export staged changes")
):
    """Export analysis report to file"""
    
    repo_path = Path(path).resolve()
    output_path = Path(output)
    
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error("Not a Git repository. Run 'copilens init' first.")
        raise typer.Exit(1)
    
    ai_detector = AIDetector()
    risk_analyzer = RiskAnalyzer()
    metrics_engine = MetricsEngine()
    
    # Get diffs
    diffs = git_analyzer.get_diff(staged=staged)
    
    if not diffs:
        print_info("No changes to export.")
        return
    
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
        
        metrics_engine.add_file_metrics(FileMetrics(
            file_path=diff.file_path,
            ai_percentage=ai_percentage,
            added_lines=diff.added_lines,
            deleted_lines=diff.deleted_lines,
            complexity=complexity_delta,
            risk_score=risk_score.total_score,
            risk_level=risk_score.level
        ))
    
    # Export
    try:
        if format.lower() == "csv":
            metrics_engine.export_csv(str(output_path))
        else:
            metrics_engine.export_json(str(output_path))
        
        print_success(f"Report exported to {output_path}")
        print_info(f"Format: {format.upper()}")
        print_info(f"Files analyzed: {len(diffs)}")
    except Exception as e:
        print_error(f"Failed to export: {str(e)}")
        raise typer.Exit(1)
