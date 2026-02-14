"""Enhanced chat command with Copilot Agent Mode integration"""
import typer
from rich.console import Console
from rich.prompt import Prompt
from rich.markdown import Markdown
from rich.panel import Panel
from copilens.core.copilot_agent import CopilotAgent, CopilotConfig
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.enhanced_ai_detector import EnhancedAIDetector
from copilens.ui.output import print_info, print_success, print_warning, print_error


console = Console()


def chat_command(
    agent_mode: bool = typer.Option(True, "--agent-mode", "-a", help="Use Copilot Agent Mode"),
    path: str = typer.Option(".", help="Repository path")
):
    """Interactive chat mode with GitHub Copilot Agent integration"""
    
    # Initialize Copilot Agent
    copilot_config = CopilotConfig(
        enabled=agent_mode,
        use_agent_mode=agent_mode,
        use_chat_api=True
    )
    copilot_agent = CopilotAgent(copilot_config)
    
    # Show welcome
    if copilot_agent.is_available and agent_mode:
        console.print(Panel(
            "[bold green]✓ GitHub Copilot Agent Mode Enabled[/bold green]\n\n"
            "You're now chatting with an AI-powered agent that can:\n"
            "  • Explain code changes in detail\n"
            "  • Suggest improvements and refactoring\n"
            "  • Analyze security concerns\n"
            "  • Provide context-aware answers",
            title="[bold cyan]Copilens Chat - Agent Mode[/bold cyan]",
            border_style="cyan"
        ))
    else:
        console.print(Panel(
            "[yellow]⚠ GitHub Copilot not detected[/yellow]\n\n"
            "Running in basic mode. For enhanced features:\n"
            "  • Install GitHub CLI: gh\n"
            "  • Install Copilot extension: gh extension install github/gh-copilot",
            title="[bold cyan]Copilens Chat - Basic Mode[/bold cyan]",
            border_style="yellow"
        ))
    
    print_info("Type 'exit' or 'quit' to leave. Type 'help' for commands.\n")
    
    # Initialize analyzers
    git_analyzer = GitAnalyzer(path)
    ai_detector = EnhancedAIDetector()
    
    # Context for the conversation
    context = {
        "is_git_repo": git_analyzer.is_git_repo(),
        "has_changes": False,
        "files_analyzed": []
    }
    
    if context["is_git_repo"]:
        diffs = git_analyzer.get_diff()
        context["has_changes"] = len(diffs) > 0
        context["files_analyzed"] = [d.file_path for d in diffs[:5]]
    
    while True:
        try:
            user_input = Prompt.ask("[bold cyan]You[/bold cyan]")
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                print_success("Goodbye!")
                break
            
            if user_input.lower() == 'help':
                show_chat_help()
                continue
            
            # Special commands
            if user_input.lower().startswith('explain'):
                handle_explain_command(
                    user_input,
                    git_analyzer,
                    ai_detector,
                    copilot_agent
                )
                continue
            
            if user_input.lower().startswith('analyze'):
                handle_analyze_command(
                    git_analyzer,
                    ai_detector,
                    copilot_agent
                )
                continue
            
            if user_input.lower().startswith('review'):
                handle_review_command(
                    user_input,
                    git_analyzer,
                    copilot_agent
                )
                continue
            
            # General conversation with agent
            if agent_mode and copilot_agent.is_available:
                response = copilot_agent.chat_with_agent(user_input, context)
            else:
                response = generate_basic_response(user_input)
            
            console.print(f"\n[bold green]Copilens Agent[/bold green]:")
            console.print(Markdown(response))
            console.print()
            
        except KeyboardInterrupt:
            print_success("\nGoodbye!")
            break
        except EOFError:
            break


def show_chat_help():
    """Show available chat commands"""
    help_text = """
**Available Commands:**

• `explain <file>` - Explain AI patterns in a specific file
• `analyze` - Run full analysis on current changes
• `review <file>` - Interactive review of a file
• `help` - Show this help message
• `exit` - Exit chat mode

**Ask Questions:**

• "How is AI detection calculated?"
• "What patterns indicate AI code?"
• "How can I improve this code?"
• "What are the security risks?"
    """
    console.print(Panel(help_text, title="[bold yellow]Chat Commands[/bold yellow]"))


def handle_explain_command(
    user_input: str,
    git_analyzer: GitAnalyzer,
    ai_detector: EnhancedAIDetector,
    copilot_agent: CopilotAgent
):
    """Handle explain command"""
    parts = user_input.split()
    if len(parts) < 2:
        print_warning("Usage: explain <file>")
        return
    
    file_path = parts[1]
    diffs = git_analyzer.get_diff()
    
    matching_diff = next((d for d in diffs if file_path in d.file_path), None)
    
    if not matching_diff:
        print_error(f"No changes found for file: {file_path}")
        return
    
    # Analyze with AI detector
    result = ai_detector.calculate_ai_percentage(
        matching_diff.diff_content,
        matching_diff.added_lines,
        matching_diff.file_path
    )
    
    console.print(f"\n[bold cyan]Analyzing {file_path}...[/bold cyan]\n")
    console.print(f"AI Percentage: [magenta]{int(result.ai_percentage * 100)}%[/magenta]")
    console.print(f"Confidence: [yellow]{result.confidence_level.upper()}[/yellow]\n")
    
    # Get Copilot explanation
    explanation = copilot_agent.explain_code(
        matching_diff.diff_content,
        context=f"File: {file_path}, AI%: {result.ai_percentage}",
        file_path=file_path
    )
    
    console.print("[bold green]Copilot Explanation:[/bold green]")
    console.print(Markdown(explanation))
    console.print()


def handle_analyze_command(
    git_analyzer: GitAnalyzer,
    ai_detector: EnhancedAIDetector,
    copilot_agent: CopilotAgent
):
    """Handle analyze command"""
    console.print("\n[bold cyan]Running comprehensive analysis...[/bold cyan]\n")
    
    diffs = git_analyzer.get_diff()
    
    if not diffs:
        print_info("No changes to analyze.")
        return
    
    # Prepare data for multi-agent analysis
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
    
    # Multi-agent analysis
    analysis = copilot_agent.multi_agent_analysis(files_data)
    
    # Display results
    console.print(Panel(
        f"**Overall Assessment:** {analysis['overall_assessment']}\n\n"
        f"**Files Analyzed:** {analysis['total_files']}\n"
        f"**High Priority:** {len(analysis['high_priority_files'])}\n"
        f"**Security Findings:** {len(analysis['security_findings'])}\n"
        f"**Code Smells:** {len(analysis['code_smells'])}",
        title="[bold green]Analysis Results[/bold green]",
        border_style="green"
    ))
    
    if analysis['security_findings']:
        console.print("\n[bold red]Security Concerns:[/bold red]")
        for concern in analysis['security_findings']:
            console.print(f"  ⚠️  {concern}")
    
    if analysis['refactoring_opportunities']:
        console.print("\n[bold yellow]Refactoring Opportunities:[/bold yellow]")
        for opportunity in analysis['refactoring_opportunities'][:3]:
            console.print(f"  💡 {opportunity}")
    
    console.print()


def handle_review_command(
    user_input: str,
    git_analyzer: GitAnalyzer,
    copilot_agent: CopilotAgent
):
    """Handle interactive review command"""
    parts = user_input.split()
    if len(parts) < 2:
        print_warning("Usage: review <file>")
        return
    
    file_path = parts[1]
    diffs = git_analyzer.get_diff()
    
    matching_diff = next((d for d in diffs if file_path in d.file_path), None)
    
    if not matching_diff:
        print_error(f"No changes found for file: {file_path}")
        return
    
    console.print(f"\n[bold cyan]Interactive Review: {file_path}[/bold cyan]\n")
    
    # Run interactive review
    ai_detector = EnhancedAIDetector()
    result = ai_detector.calculate_ai_percentage(
        matching_diff.diff_content,
        matching_diff.added_lines,
        matching_diff.file_path
    )
    
    review = copilot_agent.interactive_review(
        file_path,
        matching_diff.diff_content,
        result.ai_percentage
    )
    
    # Display review
    console.print(f"**AI Percentage:** {int(review['ai_percentage'] * 100)}%")
    console.print(f"**Quality Score:** {review['quality_score']}/5.0\n")
    
    console.print("[bold green]Explanation:[/bold green]")
    console.print(review['explanation'])
    console.print()
    
    if review['suggestions']:
        console.print("[bold yellow]Suggestions:[/bold yellow]")
        for suggestion in review['suggestions']:
            console.print(f"  • {suggestion}")
        console.print()
    
    if review['security_concerns']:
        console.print("[bold red]Security Concerns:[/bold red]")
        for concern in review['security_concerns']:
            console.print(f"  ⚠️  {concern}")
        console.print()


def generate_basic_response(user_input: str) -> str:
    """Generate basic response without Copilot"""
    user_lower = user_input.lower()
    
    if "risk" in user_lower:
        return """**Risk Calculation**

Copilens calculates risk based on:
- AI contribution percentage
- Complexity increases
- Code change size
- Security-sensitive files
- Test coverage

High-risk files need careful manual review."""
    
    elif "ai" in user_lower and "detect" in user_lower:
        return """**AI Detection Method**

Copilens uses 7 pattern-based heuristics:
1. Large code insertions (50+ lines)
2. Verbose documentation
3. Extensive type hints
4. Comprehensive error handling
5. Generic helper function names
6. Consistent code style
7. Generic variable names

See `AI_DETECTION_ALGORITHM.md` for details."""
    
    elif "copilot" in user_lower or "agent" in user_lower:
        return """**Copilot Agent Mode**

Install GitHub Copilot integration:
```bash
gh extension install github/gh-copilot
```

Agent mode provides:
- AI-powered code explanations
- Intelligent suggestions
- Security analysis
- Interactive code review"""
    
    else:
        return f"""I can help you with:
- **explain <file>** - Analyze specific files
- **analyze** - Full repository analysis
- **review <file>** - Interactive code review

Ask about:
- AI detection methods
- Risk calculation
- Code quality
- Security concerns"""
