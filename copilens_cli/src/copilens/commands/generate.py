"""
Code Generation Command using LLM
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax
from rich.progress import Progress, SpinnerColumn, TextColumn
from pathlib import Path
from typing import Optional

from ..agentic.llm_provider import get_llm, LLMMessage

console = Console()
app = typer.Typer()


@app.command()
def generate(
    description: str = typer.Argument(..., help="Description of code to generate"),
    language: Optional[str] = typer.Option(None, "--language", "-l", help="Programming language"),
    framework: Optional[str] = typer.Option(None, "--framework", "-f", help="Framework to use"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file path"),
    interactive: bool = typer.Option(False, "--interactive", "-i", help="Interactive mode"),
):
    """
    Generate code from natural language description
    
    Examples:
        copilens generate "REST API for user management" --language python --framework fastapi
        copilens generate "React component for user profile" --output UserProfile.tsx
    """
    
    console.print(f"\n[bold cyan]🎨 Generating Code...[/bold cyan]\n")
    
    # Get LLM instance
    llm = get_llm()
    
    if not llm.is_available():
        console.print(
            "[bold red]❌ No LLM provider available![/bold red]\n\n"
            "[yellow]Please set an API key:[/yellow]\n\n"
            "[cyan]Windows PowerShell:[/cyan]\n"
            "  $env:GEMINI_API_KEY=\"your-key-here\"\n\n"
            "[cyan]Windows Command Prompt:[/cyan]\n"
            "  set GEMINI_API_KEY=your-key-here\n\n"
            "[cyan]Get free Gemini API key:[/cyan]\n"
            "  https://makersuite.google.com/app/apikey\n\n"
            "[dim]Other options: OPENAI_API_KEY or ANTHROPIC_API_KEY[/dim]"
        )
        raise typer.Exit(1)
    
    # Build prompt
    prompt = f"""Generate {language or 'appropriate language'} code for: {description}

Requirements:
- Language: {language or 'auto-detect best fit'}
- Framework: {framework or 'use best practices'}
- Include: comments, error handling, type hints
- Follow: modern best practices and patterns

Provide ONLY the code, no explanations unless critical."""
    
    if framework:
        prompt += f"\n- Use {framework} framework"
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(
                f"Generating with {llm.get_active_provider_name()}...",
                total=None
            )
            
            # Generate code
            response = llm.generate(prompt)
            
            progress.update(task, completed=True)
        
        # Extract code from response (remove markdown if present)
        code = response.content.strip()
        if code.startswith('```'):
            # Remove markdown code blocks
            lines = code.split('\n')
            code = '\n'.join(lines[1:-1])  # Remove first and last line (```)
        
        # Detect language if not specified
        if not language:
            language = _detect_language(code)
        
        # Display generated code
        console.print("\n[bold green]✅ Code Generated:[/bold green]\n")
        syntax = Syntax(code, language or "python", theme="monokai", line_numbers=True)
        console.print(Panel(syntax, title=f"Generated {language or 'Code'}", border_style="green"))
        
        # Save to file if output specified
        if output:
            output_path = Path(output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(code)
            console.print(f"\n[green]💾 Saved to: {output}[/green]")
        
        # Interactive refinement
        if interactive:
            while True:
                refinement = console.input("\n[cyan]Refine code (or 'done' to finish): [/cyan]")
                if refinement.lower() in ['done', 'exit', 'quit', '']:
                    break
                
                # Refine code
                messages = [
                    LLMMessage(role="user", content=prompt),
                    LLMMessage(role="assistant", content=code),
                    LLMMessage(role="user", content=f"Please modify the code: {refinement}")
                ]
                
                response = llm.chat(messages)
                code = response.content.strip()
                
                if code.startswith('```'):
                    lines = code.split('\n')
                    code = '\n'.join(lines[1:-1])
                
                syntax = Syntax(code, language or "python", theme="monokai", line_numbers=True)
                console.print(Panel(syntax, title=f"Refined {language or 'Code'}", border_style="cyan"))
                
                if output:
                    Path(output).write_text(code)
                    console.print(f"[green]💾 Updated: {output}[/green]")
        
        console.print("\n[bold green]✨ Generation complete![/bold green]\n")
    
    except Exception as e:
        console.print(f"\n[bold red]❌ Generation failed: {e}[/bold red]\n")
        raise typer.Exit(1)


def _detect_language(code: str) -> str:
    """Detect programming language from code"""
    code_lower = code.lower()
    
    if 'def ' in code or 'import ' in code or 'class ' in code and ':' in code:
        return "python"
    elif 'function' in code or 'const ' in code or '=>' in code:
        if 'interface' in code or ': ' in code and '{' in code:
            return "typescript"
        return "javascript"
    elif 'public class' in code or 'private ' in code:
        return "java"
    elif 'func ' in code or 'package ' in code:
        return "go"
    elif 'fn ' in code or 'let mut' in code:
        return "rust"
    elif '<?php' in code:
        return "php"
    
    return "text"


if __name__ == "__main__":
    app()
