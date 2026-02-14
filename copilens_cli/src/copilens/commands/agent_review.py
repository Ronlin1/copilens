"""Agent-powered code review command"""
import typer
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.enhanced_ai_detector import EnhancedAIDetector
from copilens.core.copilot_agent import CopilotAgent
from copilens.ui.output import print_error, print_success, print_info

console = Console()


def agent_review_command(
    file: str = typer.Argument(None, help="Specific file to review"),
    path: str = typer.Option(".", help="Repository path"),
    full: bool = typer.Option(False, "--full", "-f", help="Full multi-agent analysis")
):
    """AI-powered code review using Copilot Agent Mode"""
    
    repo_path = Path(path).resolve()
    
    # Initialize components
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error("Not a Git repository. Run 'copilens init' first.")
        raise typer.Exit(1)
    
    copilot_agent = CopilotAgent()
    ai_detector = EnhancedAIDetector()
    
    # Check Copilot availability
    if not copilot_agent.is_available:
        console.print(Panel(
            "[yellow]GitHub Copilot not detected.[/yellow]\n\n"
            "For enhanced agent-powered reviews, install:\n"
            "  gh extension install github/gh-copilot\n\n"
            "Continuing with basic review...",
            title="⚠️  Agent Mode Unavailable",
            border_style="yellow"
        ))
    
    # Get diffs
    diffs = git_analyzer.get_diff()
    
    if not diffs:
        print_info("No changes to review.")
        return
    
    # Filter for specific file if requested
    if file:
        diffs = [d for d in diffs if file in d.file_path]
        if not diffs:
            print_error(f"No changes found for file: {file}")
            return
    
    console.print(f"\n[bold cyan]🤖 Agent-Powered Code Review[/bold cyan]\n")
    console.print(f"Analyzing {len(diffs)} file(s)...\n")
    
    if full:
        # Multi-agent comprehensive analysis
        perform_multi_agent_review(diffs, ai_detector, copilot_agent)
    else:
        # Individual file reviews
        for diff in diffs:
            perform_single_file_review(diff, ai_detector, copilot_agent)


def perform_single_file_review(diff, ai_detector, copilot_agent):
    """Review a single file with agent assistance"""
    
    # Analyze AI contribution
    result = ai_detector.calculate_ai_percentage(
        diff.diff_content,
        diff.added_lines,
        diff.file_path
    )
    
    # Get agent review
    review = copilot_agent.interactive_review(
        diff.file_path,
        diff.diff_content,
        result.ai_percentage
    )
    
    # Create review panel
    review_content = f"""**File:** {diff.file_path}
**AI Contribution:** {int(result.ai_percentage * 100)}% ({result.confidence_level} confidence)
**Quality Score:** {review['quality_score']}/5.0
**Lines Changed:** +{diff.added_lines} / -{diff.deleted_lines}

**Analysis:**
{review['explanation']}
"""
    
    console.print(Panel(
        review_content,
        title=f"📄 {diff.file_path}",
        border_style="cyan"
    ))
    
    # Show suggestions
    if review['suggestions']:
        table = Table(title="💡 Suggestions", show_header=False)
        table.add_column("Suggestion", style="yellow")
        
        for suggestion in review['suggestions']:
            table.add_row(f"• {suggestion}")
        
        console.print(table)
    
    # Show security concerns
    if review['security_concerns']:
        console.print("\n[bold red]⚠️  Security Concerns:[/bold red]")
        for concern in review['security_concerns']:
            console.print(f"  [red]• {concern}[/red]")
    
    console.print("\n" + "─" * 70 + "\n")


def perform_multi_agent_review(diffs, ai_detector, copilot_agent):
    """Comprehensive multi-agent review"""
    
    # Prepare file data
    files_data = []
    for diff in diffs:
        result = ai_detector.calculate_ai_percentage(
            diff.diff_content,
            diff.added_lines,
            diff.file_path
        )
        files_data.append({
            "file_path": diff.file_path,
            "content": diff.diff_content,
            "ai_percentage": result.ai_percentage,
            "added_lines": diff.added_lines
        })
    
    # Run multi-agent analysis
    console.print("[bold cyan]Running multi-agent analysis...[/bold cyan]\n")
    analysis = copilot_agent.multi_agent_analysis(files_data)
    
    # Display overall assessment
    console.print(Panel(
        f"**{analysis['overall_assessment']}**\n\n"
        f"Files Analyzed: {analysis['total_files']}\n"
        f"High Priority: {len(analysis['high_priority_files'])}\n"
        f"Security Findings: {len(analysis['security_findings'])}\n"
        f"Code Smells: {len(analysis['code_smells'])}\n"
        f"Refactoring Opportunities: {len(analysis['refactoring_opportunities'])}",
        title="📊 Multi-Agent Analysis Results",
        border_style="green"
    ))
    
    # High priority files
    if analysis['high_priority_files']:
        console.print("\n[bold red]🚨 High Priority Files (Require Review):[/bold red]")
        for file_path in analysis['high_priority_files']:
            console.print(f"  • {file_path}")
    
    # Security findings
    if analysis['security_findings']:
        console.print("\n[bold red]🔒 Security Findings:[/bold red]")
        for finding in analysis['security_findings']:
            console.print(f"  ⚠️  {finding}")
    
    # Code smells
    if analysis['code_smells']:
        console.print("\n[bold yellow]👃 Code Smells:[/bold yellow]")
        for smell in analysis['code_smells'][:5]:  # Show top 5
            console.print(f"  • {smell}")
    
    # Refactoring opportunities
    if analysis['refactoring_opportunities']:
        console.print("\n[bold blue]♻️  Refactoring Opportunities:[/bold blue]")
        for opportunity in analysis['refactoring_opportunities'][:5]:
            console.print(f"  💡 {opportunity}")
    
    console.print("\n" + "=" * 70)
    print_success("Multi-agent review complete!")
