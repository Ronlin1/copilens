"""Main CLI application entry point"""
import typer
from rich.console import Console
from copilens.commands import (
    init, stats, diff, risk, explain, chat, chat_enhanced, 
    trend, export_report, agent_review, agent,
    generate, deploy, monitor, remote, config, chat_ai
)
from copilens.ui.welcome import show_welcome

app = typer.Typer(
    name="copilens",
    help="AI Transparency, Code Intelligence & Deployment Platform",
    add_completion=False,
    invoke_without_command=True,
)

console = Console()

# Core Analysis Commands
app.command(name="init")(init.init_command)
app.command(name="stats")(stats.stats_command)
app.command(name="diff")(diff.diff_command)
app.command(name="risk")(risk.risk_command)
app.command(name="explain")(explain.explain_command)
app.command(name="agent-review")(agent_review.agent_review_command)
app.command(name="trend")(trend.trend_command)
app.command(name="export")(export_report.export_command)

# NEW: Comprehensive Chat (replaces chat-ai and chat-enhanced)
app.add_typer(chat.app, name="chat", help="💬 AI chat with file system access")

# Agentic Commands
app.command(name="agent")(agent.agent_command)
app.command(name="agent-status")(agent.agent_status_command)
app.command(name="agent-memory")(agent.agent_memory_command)

# NEW: Code Generation Commands
app.add_typer(generate.app, name="generate", help="Generate code from natural language")

# NEW: Deployment Commands
app.add_typer(deploy.app, name="deploy", help="Deploy project to cloud platforms")
app.command(name="detect-arch")(deploy.detect_arch)
app.command(name="deploy-status")(deploy.status)

# NEW: Monitoring Commands
app.add_typer(monitor.app, name="monitor", help="Monitor deployed applications")

# NEW: Remote Repository Analysis
app.add_typer(remote.app, name="remote", help="Analyze remote repositories (GitHub/GitLab)")

# NEW: Configuration Management
app.add_typer(config.app, name="config", help="Manage API keys and configuration")

# Legacy commands (keep for backwards compatibility)
app.add_typer(chat_ai.app, name="chat-ai", help="[LEGACY] Use 'chat' instead")
app.command(name="chat-old")(chat_enhanced.chat_command)


@app.callback()
def callback(ctx: typer.Context):
    """
    Copilens CLI - Track and analyze AI-generated code changes
    """
    # Show welcome screen if no command is provided
    if ctx.invoked_subcommand is None:
        show_welcome()


if __name__ == "__main__":
    app()
