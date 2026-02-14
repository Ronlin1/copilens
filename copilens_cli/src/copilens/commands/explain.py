"""Explain command - Explain AI-generated changes"""
import typer
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.ai_detector import AIDetector
from copilens.ui.output import print_error, print_info, console
from rich.markdown import Markdown


def explain_command(
    file: str = typer.Argument(None, help="File to explain"),
    path: str = typer.Option(".", help="Repository path"),
    staged: bool = typer.Option(False, "--staged", "-s", help="Explain staged changes")
):
    """Explain AI-generated code changes"""
    
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
    
    # Explain each file
    for diff in diffs:
        patterns = ai_detector.detect_ai_patterns(diff.diff_content, diff.added_lines)
        ai_percentage = ai_detector.calculate_ai_percentage(diff.diff_content, diff.added_lines)
        
        console.print(f"\n[bold cyan]═══ {diff.file_path} ═══[/bold cyan]\n")
        
        # Summary
        console.print(f"**AI Contribution:** {int(ai_percentage * 100)}%")
        console.print(f"**Lines Changed:** +{diff.added_lines} / -{diff.deleted_lines}\n")
        
        # Explanation
        explanation = generate_explanation(diff, patterns, ai_percentage)
        console.print(Markdown(explanation))
        console.print()


def generate_explanation(diff, patterns, ai_percentage):
    """Generate human-readable explanation"""
    
    if ai_percentage > 0.7:
        confidence = "high"
    elif ai_percentage > 0.4:
        confidence = "moderate"
    else:
        confidence = "low"
    
    explanation = f"### Analysis\n\n"
    explanation += f"This change shows **{confidence} confidence** of AI-generated code ({int(ai_percentage * 100)}%).\n\n"
    
    if patterns:
        explanation += "### Detected Patterns\n\n"
        for pattern in patterns:
            explanation += f"- **{pattern.pattern_type.replace('_', ' ').title()}** "
            explanation += f"(Confidence: {int(pattern.confidence * 100)}%): {pattern.description}\n"
        explanation += "\n"
    
    # Recommendations
    explanation += "### Recommendations\n\n"
    
    if ai_percentage > 0.6:
        explanation += "- **Review Carefully:** High AI contribution detected. Ensure the code meets your requirements.\n"
        explanation += "- **Test Thoroughly:** Add comprehensive tests to validate functionality.\n"
    
    if diff.added_lines > 100:
        explanation += "- **Large Addition:** Consider breaking into smaller, reviewable chunks.\n"
    
    if any(p.pattern_type == "boilerplate" for p in patterns):
        explanation += "- **Boilerplate Detected:** Verify it follows your project conventions.\n"
    
    explanation += "- **Security Check:** Review for potential security implications.\n"
    
    return explanation
