"""Init command - Initialize Copilens in repository"""
import typer
from pathlib import Path
from copilens.core.config import ConfigManager
from copilens.core.git_analyzer import GitAnalyzer
from copilens.ui.output import print_success, print_error, print_info


def init_command(
    path: str = typer.Argument(".", help="Repository path")
):
    """Initialize Copilens in your Git repository"""
    
    repo_path = Path(path).resolve()
    
    # Check if it's a Git repository
    git_analyzer = GitAnalyzer(str(repo_path))
    if not git_analyzer.is_git_repo():
        print_error(f"Not a Git repository: {repo_path}")
        print_info("Please run this command in a Git repository or initialize Git first:")
        print_info("  git init")
        raise typer.Exit(1)
    
    # Create configuration
    config_manager = ConfigManager(str(repo_path))
    config_manager.init_config()
    
    print_success(f"Copilens initialized in {repo_path}")
    print_info(f"Configuration saved to {repo_path / '.copilens.json'}")
    print_info("")
    print_info("Next steps:")
    print_info("  copilens stats     - View AI contribution statistics")
    print_info("  copilens diff      - Analyze current diff")
    print_info("  copilens risk      - Check risk score")
