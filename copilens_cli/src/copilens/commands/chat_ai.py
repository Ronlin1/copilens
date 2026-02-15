"""
Interactive AI Chat Command
Chat with Gemini 3 Pro about your code
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.prompt import Prompt
from pathlib import Path
from typing import Optional, List

from ..agentic.gemini3_provider import get_gemini3, ThinkingResponse
from ..core.config_manager import get_config
from ..analyzers.repo_analyzer import RepositoryAnalyzer

console = Console()
app = typer.Typer(invoke_without_command=True)


@app.callback()
def chat_callback(ctx: typer.Context):
    """
    Interactive chat with Gemini 3 Pro
    
    Run 'copilens chat-ai --help' to see available commands.
    """
    if ctx.invoked_subcommand is None:
        # Show help when no subcommand given
        console.print("\n[bold cyan]🤖 Copilens AI Chat[/bold cyan]\n")
        console.print("Chat with Gemini 3 Pro about your code!\n")
        
        console.print("[bold]Available Commands:[/bold]")
        console.print("  [green]copilens chat-ai interactive[/green]          - Start interactive chat")
        console.print("  [green]copilens chat-ai interactive --analyze[/green] - Chat with repo context")
        console.print("  [green]copilens chat-ai quick \"question\"[/green]     - Ask quick question")
        
        console.print("\n[bold yellow]Quick Start:[/bold yellow]")
        console.print("  1. Set API key: [cyan]copilens config setup[/cyan]")
        console.print("  2. Start chat:  [cyan]copilens chat-ai interactive[/cyan]")
        
        console.print("\n[dim]Run 'copilens chat-ai --help' for more info[/dim]\n")


class ChatSession:
    """Interactive chat session with Gemini 3"""
    
    def __init__(self, context: Optional[str] = None):
        self.gemini = get_gemini3()
        self.history: List[dict] = []
        self.context = context
    
    def add_message(self, role: str, content: str):
        """Add message to history"""
        self.history.append({"role": role, "content": content})
    
    def get_context_prompt(self) -> str:
        """Get initial context prompt"""
        if not self.context:
            return ""
        
        return f"""You are an expert code assistant helping with this codebase.

CODEBASE CONTEXT:
{self.context}

Please provide helpful, accurate, and concise answers about this code.
Use markdown formatting for better readability.
"""
    
    def chat(self, user_message: str) -> str:
        """Send message and get response"""
        # Build full prompt with history
        full_prompt = ""
        
        # Add context if first message
        if len(self.history) == 0 and self.context:
            full_prompt += self.get_context_prompt() + "\n\n"
        
        # Add conversation history
        for msg in self.history[-10:]:  # Last 10 messages for context
            role = "User" if msg["role"] == "user" else "Assistant"
            full_prompt += f"{role}: {msg['content']}\n\n"
        
        # Add current message
        full_prompt += f"User: {user_message}\n\nAssistant:"
        
        # Get response from Gemini
        try:
            response = self.gemini.analyze_code(
                prompt=full_prompt,
                use_search=True,
                thinking_level="HIGH",
                stream=False
            )
            
            assistant_message = response.content
            
            # Add to history
            self.add_message("user", user_message)
            self.add_message("assistant", assistant_message)
            
            return assistant_message
            
        except Exception as e:
            return f"Error: {e}"


@app.command(name="interactive")
def interactive_chat(
    analyze_repo: bool = typer.Option(
        False,
        "--analyze",
        "-a",
        help="Analyze current repository for context"
    ),
):
    """
    Interactive AI chat with Gemini 3 Pro
    
    Features:
    - Deep thinking enabled
    - Google Search integration
    - Conversation history
    - Optional repository context
    
    Commands in chat:
      /exit or /quit - Exit chat
      /clear - Clear conversation history
      /help - Show help
    
    Example:
      copilens chat interactive
      copilens chat interactive --analyze
    """
    # Check API key
    config = get_config()
    api_key = config.get_api_key('gemini')
    
    if not api_key:
        console.print(
            "\n[bold red]❌ No Gemini API key found![/bold red]\n\n"
            "[yellow]Set up your API key:[/yellow]\n\n"
            "[cyan]Option 1: Quick setup wizard[/cyan]\n"
            "  copilens config setup\n\n"
            "[cyan]Option 2: Set directly[/cyan]\n"
            "  copilens config set gemini YOUR_API_KEY\n\n"
            "[cyan]Get free key:[/cyan]\n"
            "  https://makersuite.google.com/app/apikey\n"
        )
        raise typer.Exit(1)
    
    # Set environment variable for this session
    import os
    os.environ['GEMINI_API_KEY'] = api_key
    
    # Get repository context if requested
    context = None
    if analyze_repo:
        console.print("\n[cyan]Analyzing repository...[/cyan]")
        try:
            analyzer = RepositoryAnalyzer(".")
            analysis = analyzer.analyze()
            
            context = f"""Repository Information:
- Total Files: {analysis['file_count']}
- Total Lines: {analysis['total_lines']:,}
- Languages: {', '.join(list(analysis.get('languages', {}).keys())[:5])}
- Quality Score: {analysis['quality_score']}/100
"""
            
            # Add file list
            files = analyzer._scan_files()
            context += "\n\nKey Files:\n"
            for file in files[:20]:
                context += f"- {file['path']} ({file['lines']} lines, {file['language']})\n"
            
            console.print("[green]✓ Repository analyzed[/green]")
        except Exception as e:
            console.print(f"[yellow]Warning: Could not analyze repository: {e}[/yellow]")
    
    # Create chat session
    session = ChatSession(context=context)
    
    # Welcome message
    console.print(Panel(
        "[bold]Welcome to Copilens AI Chat![/bold]\n\n"
        "Powered by Gemini 3 Pro with:\n"
        "  🧠 Deep thinking (HIGH level)\n"
        "  🔍 Google Search integration\n"
        "  💬 Conversation history\n\n"
        f"{'📁 Repository context loaded' if context else '💡 Tip: Use --analyze to add repo context'}\n\n"
        "[dim]Commands: /exit, /clear, /help[/dim]",
        title="[bold cyan]Copilens AI Chat[/bold cyan]",
        border_style="cyan"
    ))
    
    # Chat loop
    while True:
        try:
            # Get user input
            user_input = Prompt.ask("\n[bold cyan]You[/bold cyan]")
            
            if not user_input.strip():
                continue
            
            # Handle commands
            if user_input.startswith('/'):
                command = user_input.lower().strip()
                
                if command in ['/exit', '/quit']:
                    console.print("\n[green]Goodbye! 👋[/green]\n")
                    break
                
                elif command == '/clear':
                    session.history = []
                    console.print("[yellow]Conversation history cleared[/yellow]")
                    continue
                
                elif command == '/help':
                    console.print(Panel(
                        "[bold]Chat Commands:[/bold]\n\n"
                        "/exit, /quit - Exit chat\n"
                        "/clear - Clear conversation history\n"
                        "/help - Show this help\n\n"
                        "[bold]Tips:[/bold]\n"
                        "• Ask about code, architecture, best practices\n"
                        "• Request code reviews or explanations\n"
                        "• Get refactoring suggestions\n"
                        "• Ask for security analysis\n"
                        "• Gemini will search Google for context when needed",
                        title="[cyan]Help[/cyan]"
                    ))
                    continue
                
                else:
                    console.print(f"[red]Unknown command: {command}[/red]")
                    continue
            
            # Get AI response
            console.print("\n[dim]Thinking...[/dim]")
            response = session.chat(user_input)
            
            # Display response
            console.print(Panel(
                Markdown(response),
                title="[bold green]AI Assistant[/bold green]",
                border_style="green"
            ))
        
        except KeyboardInterrupt:
            console.print("\n\n[yellow]Chat interrupted. Type /exit to quit.[/yellow]")
            continue
        except EOFError:
            console.print("\n[green]Goodbye! 👋[/green]\n")
            break
        except Exception as e:
            console.print(f"\n[red]Error: {e}[/red]")
            console.print("[yellow]Please try again or type /exit to quit.[/yellow]")


@app.command(name="quick")
def quick_question(
    question: str = typer.Argument(..., help="Your question"),
):
    """
    Ask a quick question without entering interactive mode
    
    Example:
      copilens chat quick "What are best practices for Python error handling?"
    """
    # Check API key
    config = get_config()
    api_key = config.get_api_key('gemini')
    
    if not api_key:
        console.print("[red]No API key found. Run: copilens config setup[/red]")
        raise typer.Exit(1)
    
    import os
    os.environ['GEMINI_API_KEY'] = api_key
    
    # Get response
    gemini = get_gemini3()
    
    console.print(f"\n[bold cyan]Question:[/bold cyan] {question}\n")
    console.print("[dim]Thinking...[/dim]\n")
    
    try:
        response = gemini.analyze_code(
            prompt=f"Please answer this question concisely:\n\n{question}",
            use_search=True,
            thinking_level="MEDIUM",
            stream=False
        )
        
        console.print(Panel(
            Markdown(response.content),
            title="[bold green]Answer[/bold green]",
            border_style="green"
        ))
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
