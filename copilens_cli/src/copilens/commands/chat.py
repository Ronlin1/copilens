"""
Comprehensive AI Chat with File System Access
Unified chat command for local and remote code analysis
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.table import Table
from pathlib import Path
from typing import Optional, List
import os

from copilens.core.file_system_tools import FileSystemTools
from copilens.core.config_manager import get_config
from copilens.agentic.gemini3_provider import Gemini3Provider, create_analysis_prompt
from copilens.analyzers.repo_analyzer import RepositoryAnalyzer

app = typer.Typer(help="💬 AI Chat with file system and code analysis")
console = Console()


def chat_callback(ctx: typer.Context):
    """Show help when no subcommand provided"""
    if ctx.invoked_subcommand is None:
        console.print("\n[bold cyan]💬 Copilens AI Chat[/bold cyan]\n")
        
        # Check API key
        config = get_config()
        api_key = config.get_api_key('gemini')
        
        if api_key:
            console.print("[green]✓ Gemini API configured[/green]")
        else:
            console.print("[red]✗ No Gemini API key found[/red]")
            console.print("[yellow]Run: copilens config setup[/yellow]\n")
            return
        
        console.print(Panel(
            "[bold]Interactive AI chat with powerful capabilities:[/bold]\n\n"
            "• 📂 Read and analyze local files\n"
            "• ✏️  Modify and create files\n"
            "• 🌍 Analyze remote repositories\n"
            "• 🔍 Search code and directories\n"
            "• 🏗️  Architecture analysis\n"
            "• 🤖 Code generation and refactoring\n\n"
            "[dim]Powered by Gemini 3 Pro with thinking + Google Search[/dim]",
            border_style="cyan",
            title="Features"
        ))
        
        console.print("\n[bold]Quick Start:[/bold]")
        console.print("  [cyan]copilens chat[/cyan]             - Start interactive chat")
        console.print("  [cyan]copilens chat --analyze[/cyan]   - Chat with repo analysis")
        console.print("  [cyan]copilens chat <question>[/cyan]  - Ask quick question")
        
        console.print("\n[bold]Chat Commands:[/bold]")
        console.print("  [dim]/read <file>[/dim]      - Read file contents")
        console.print("  [dim]/write <file>[/dim]     - Write to file")
        console.print("  [dim]/tree [dir][/dim]       - Show directory tree")
        console.print("  [dim]/search <pattern>[/dim] - Search files")
        console.print("  [dim]/analyze [dir][/dim]    - Analyze directory")
        console.print("  [dim]/stats[/dim]            - Repository statistics")
        console.print("  [dim]/remote <url>[/dim]     - Analyze remote repo")
        console.print("  [dim]/clear[/dim]            - Clear conversation")
        console.print("  [dim]/help[/dim]             - Show all commands")
        console.print("  [dim]/exit[/dim]             - Exit chat\n")


@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    question: Optional[List[str]] = typer.Argument(None, help="Quick question to ask"),
    analyze: bool = typer.Option(False, "--analyze", "-a", help="Include repository analysis"),
):
    """
    Start AI chat or ask a quick question
    
    Examples:
        copilens chat
        copilens chat --analyze
        copilens chat "How can I improve this code?"
    """
    chat_callback(ctx)
    
    if ctx.invoked_subcommand is not None:
        return
    
    # Check for question argument
    if question:
        question_str = " ".join(question)
        quick_question(question_str, analyze)
    else:
        interactive_chat(analyze)


def interactive_chat(analyze_repo: bool = False):
    """Interactive AI chat session with file system access"""
    
    # Initialize
    config = get_config()
    api_key = config.get_api_key('gemini')
    
    if not api_key:
        console.print("[red]✗ No Gemini API key configured[/red]")
        console.print("[yellow]Run: copilens config setup[/yellow]")
        return
    
    provider = Gemini3Provider(api_key)
    if not provider.is_available():
        console.print("[red]✗ Gemini 3 not available[/red]")
        console.print("[yellow]Install: pip install google-genai[/yellow]")
        return
    
    # Initialize tools
    fs_tools = FileSystemTools()
    conversation_history = []
    
    # Welcome message
    console.print("\n[bold green]🤖 Copilens AI Chat Started![/bold green]")
    console.print(Panel(
        f"[bold]Current Directory:[/bold] {Path.cwd()}\n"
        f"[bold]Model:[/bold] Gemini 3 Pro (Flash)\n"
        f"[bold]Features:[/bold] Deep thinking, Google Search, File system access\n\n"
        "[dim]Type /help for commands or /exit to quit[/dim]",
        border_style="green"
    ))
    
    # Load repository context if requested
    context_parts = []
    if analyze_repo:
        console.print("\n[yellow]🔍 Analyzing repository...[/yellow]")
        try:
            analyzer = RepositoryAnalyzer()
            analysis = analyzer.analyze()
            
            context_parts.append(f"""
REPOSITORY CONTEXT:
- Total Files: {analysis['summary']['total_files']}
- Languages: {', '.join(analysis['languages'].keys())}
- Total Lines: {analysis['summary']['total_lines']}
- Average Complexity: {analysis['summary']['avg_complexity']:.1f}
- Quality Score: {analysis['summary']['quality_score']}/100
""")
            console.print("[green]✓ Repository analyzed![/green]\n")
        except Exception as e:
            console.print(f"[yellow]⚠️  Could not analyze repo: {e}[/yellow]\n")
    
    # Chat loop
    while True:
        try:
            # Get user input
            user_input = console.input("\n[bold cyan]You:[/bold cyan] ").strip()
            
            if not user_input:
                continue
            
            # Handle commands
            if user_input.startswith('/'):
                result = handle_command(user_input, fs_tools, provider, conversation_history)
                if result == "exit":
                    break
                elif result == "clear":
                    conversation_history = []
                    console.print("[green]✓ Conversation cleared[/green]")
                continue
            
            # Build full prompt with context
            full_prompt = ""
            
            if context_parts:
                full_prompt = "\n".join(context_parts) + "\n\n"
            
            # Add conversation history (last 5 exchanges)
            if conversation_history:
                full_prompt += "CONVERSATION HISTORY:\n"
                for msg in conversation_history[-10:]:  # Last 5 exchanges
                    full_prompt += f"{msg['role']}: {msg['content']}\n"
                full_prompt += "\n"
            
            full_prompt += f"USER QUESTION: {user_input}\n\n"
            full_prompt += """Provide a helpful, specific answer. 
- Use markdown formatting
- Include code examples where relevant
- Be concise but thorough
- If suggesting file operations, use /read or /write commands
"""
            
            # Get AI response
            console.print("\n[bold magenta]AI:[/bold magenta] ", end="")
            
            try:
                response = provider.analyze_code(
                    full_prompt,
                    use_search=True,
                    thinking_level="MEDIUM",
                    stream=False
                )
                
                # Display response as markdown
                console.print(Markdown(response.content))
                
                # Add to conversation history
                conversation_history.append({"role": "User", "content": user_input})
                conversation_history.append({"role": "AI", "content": response.content})
                
            except Exception as e:
                console.print(f"[red]Error: {e}[/red]")
        
        except KeyboardInterrupt:
            console.print("\n[yellow]Use /exit to quit[/yellow]")
        except Exception as e:
            console.print(f"\n[red]Error: {e}[/red]")
    
    console.print("\n[bold green]👋 Chat ended. Goodbye![/bold green]\n")


def handle_command(command: str, fs_tools: FileSystemTools, provider: Gemini3Provider, history: list) -> Optional[str]:
    """Handle chat commands"""
    
    parts = command.split(maxsplit=1)
    cmd = parts[0].lower()
    arg = parts[1] if len(parts) > 1 else None
    
    # Exit
    if cmd in ['/exit', '/quit', '/q']:
        return "exit"
    
    # Clear
    if cmd == '/clear':
        return "clear"
    
    # Help
    if cmd == '/help':
        show_help()
        return None
    
    # Read file
    if cmd == '/read':
        if not arg:
            console.print("[red]Usage: /read <file_path>[/red]")
            return None
        
        success, result = fs_tools.read_file(arg)
        if success:
            # Detect language from extension
            ext = Path(arg).suffix.lstrip('.')
            if ext:
                syntax = Syntax(result, ext, theme="monokai", line_numbers=True)
                console.print(f"\n[bold]File:[/bold] {arg}\n")
                console.print(syntax)
            else:
                console.print(f"\n[bold]File:[/bold] {arg}\n")
                console.print(result)
        else:
            console.print(f"[red]✗ {result}[/red]")
        return None
    
    # Write file
    if cmd == '/write':
        if not arg:
            console.print("[red]Usage: /write <file_path>[/red]")
            console.print("[yellow]Then enter content (Ctrl+Z then Enter to finish on Windows)[/yellow]")
            return None
        
        console.print(f"[yellow]Enter content for {arg} (Ctrl+Z then Enter to finish):[/yellow]")
        lines = []
        try:
            while True:
                line = input()
                lines.append(line)
        except EOFError:
            pass
        
        content = "\n".join(lines)
        success, result = fs_tools.write_file(arg, content)
        
        if success:
            console.print(f"[green]✓ {result}[/green]")
        else:
            console.print(f"[red]✗ {result}[/red]")
        return None
    
    # Directory tree
    if cmd == '/tree':
        directory = arg or "."
        success, result = fs_tools.create_tree(directory)
        
        if success:
            console.print(f"\n{result}")
        else:
            console.print(f"[red]✗ {result}[/red]")
        return None
    
    # Search files
    if cmd == '/search':
        if not arg:
            console.print("[red]Usage: /search <pattern>[/red]")
            return None
        
        success, result = fs_tools.search_files(arg)
        if success:
            if result:
                console.print(f"\n[bold]Found {len(result)} matches:[/bold]")
                for match in result[:20]:  # Show first 20
                    console.print(f"  • {match}")
                if len(result) > 20:
                    console.print(f"[dim]  ... and {len(result) - 20} more[/dim]")
            else:
                console.print("[yellow]No matches found[/yellow]")
        else:
            console.print(f"[red]✗ {result}[/red]")
        return None
    
    # Analyze directory
    if cmd == '/analyze':
        directory = arg or "."
        success, result = fs_tools.analyze_directory(directory)
        
        if success:
            table = Table(title=f"Directory Analysis: {directory}")
            table.add_column("Metric", style="cyan")
            table.add_column("Value", style="green")
            
            table.add_row("Total Files", str(result['total_files']))
            table.add_row("Total Directories", str(result['total_directories']))
            table.add_row("Total Size", result['total_size'])
            
            console.print("\n", table)
            
            # Show file types
            console.print("\n[bold]Most Common File Types:[/bold]")
            for ext, count in result['most_common_types'][:5]:
                console.print(f"  {ext:20} {count:>5} files")
        else:
            console.print(f"[red]✗ {result['error']}[/red]")
        return None
    
    # Stats
    if cmd == '/stats':
        try:
            from copilens.analyzers.repo_analyzer import RepositoryAnalyzer
            analyzer = RepositoryAnalyzer()
            analysis = analyzer.analyze()
            
            table = Table(title="Repository Statistics")
            table.add_column("Metric", style="cyan")
            table.add_column("Value", style="green")
            
            table.add_row("Total Files", str(analysis['summary']['total_files']))
            table.add_row("Total Lines", str(analysis['summary']['total_lines']))
            table.add_row("Languages", str(len(analysis['languages'])))
            table.add_row("Avg Complexity", f"{analysis['summary']['avg_complexity']:.1f}")
            table.add_row("Quality Score", f"{analysis['summary']['quality_score']}/100")
            
            console.print("\n", table)
        except Exception as e:
            console.print(f"[red]✗ Error: {e}[/red]")
        return None
    
    # Remote analysis
    if cmd == '/remote':
        if not arg:
            console.print("[red]Usage: /remote <repository_url>[/red]")
            return None
        
        console.print(f"\n[yellow]🔍 Analyzing {arg}...[/yellow]")
        try:
            from copilens.analyzers.remote_analyzer import RemoteRepoAnalyzer
            
            with RemoteRepoAnalyzer(arg) as analyzer:
                info = analyzer.get_repository_info()
                arch_info = analyzer.analyze()
                
                console.print(f"[green]✓ Repository: {info['platform']} - {info['owner']}/{info['repo']}[/green]")
                console.print(f"[dim]  Architecture: {arch_info['type']}[/dim]")
                console.print(f"[dim]  Components: {', '.join(arch_info['components'])}[/dim]")
        except Exception as e:
            console.print(f"[red]✗ Error: {e}[/red]")
        return None
    
    # Unknown command
    console.print(f"[red]Unknown command: {cmd}[/red]")
    console.print("[yellow]Type /help for available commands[/yellow]")
    return None


def show_help():
    """Show help for chat commands"""
    table = Table(title="Chat Commands", show_header=True)
    table.add_column("Command", style="cyan", width=25)
    table.add_column("Description", style="white")
    
    commands = [
        ("/read <file>", "Read and display file contents"),
        ("/write <file>", "Write content to file"),
        ("/tree [dir]", "Show directory tree"),
        ("/search <pattern>", "Search for files by name"),
        ("/analyze [dir]", "Analyze directory structure"),
        ("/stats", "Show repository statistics"),
        ("/remote <url>", "Analyze remote repository"),
        ("/clear", "Clear conversation history"),
        ("/help", "Show this help message"),
        ("/exit, /quit, /q", "Exit chat"),
    ]
    
    for cmd, desc in commands:
        table.add_row(cmd, desc)
    
    console.print("\n", table)


def quick_question(question: str, analyze_repo: bool = False):
    """Ask a quick question without interactive mode"""
    
    config = get_config()
    api_key = config.get_api_key('gemini')
    
    if not api_key:
        console.print("[red]✗ No Gemini API key configured[/red]")
        console.print("[yellow]Run: copilens config setup[/yellow]")
        return
    
    provider = Gemini3Provider(api_key)
    if not provider.is_available():
        console.print("[red]✗ Gemini 3 not available[/red]")
        return
    
    # Build prompt
    prompt = ""
    
    if analyze_repo:
        console.print("[yellow]🔍 Analyzing repository...[/yellow]")
        try:
            analyzer = RepositoryAnalyzer()
            analysis = analyzer.analyze()
            
            prompt = f"""
REPOSITORY CONTEXT:
- Total Files: {analysis['summary']['total_files']}
- Languages: {', '.join(analysis['languages'].keys())}
- Total Lines: {analysis['summary']['total_lines']}
- Quality Score: {analysis['summary']['quality_score']}/100

"""
        except:
            pass
    
    prompt += f"QUESTION: {question}\n\nProvide a concise, helpful answer with code examples if relevant."
    
    # Get response
    console.print(f"\n[bold cyan]Q:[/bold cyan] {question}\n")
    console.print("[bold magenta]A:[/bold magenta]\n")
    
    try:
        response = provider.analyze_code(prompt, use_search=True, thinking_level="MEDIUM")
        console.print(Markdown(response.content))
        console.print()
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


if __name__ == "__main__":
    app()
