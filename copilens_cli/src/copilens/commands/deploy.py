"""
Deployment Commands for Copilens
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from pathlib import Path

from ..deployment.manager import DeploymentManager, SimpleDockerDeployer
from ..deployment.validator import DeploymentValidator
from ..analyzers.architecture_detector import ArchitectureDetector
from ..analyzers.config_detector import ConfigDetector

console = Console()
app = typer.Typer()


@app.command()
def deploy(
    platform: str = typer.Option(None, "--platform", "-p", help="Deployment platform (auto-select if not specified)"),
    auto: bool = typer.Option(False, "--auto", "-a", help="Fully autonomous deployment"),
    prepare_only: bool = typer.Option(False, "--prepare", help="Only prepare, don't deploy"),
    auto_fix: bool = typer.Option(False, "--auto-fix", help="Automatically fix deployment issues"),
    skip_validation: bool = typer.Option(False, "--skip-validation", help="Skip validation checks"),
):
    """
    Deploy project to cloud platform
    
    Supported platforms: railway, vercel, netlify, render, cloudrun
    
    Examples:
        copilens deploy --platform railway
        copilens deploy --auto  # Auto-select best platform
        copilens deploy --auto-fix  # Auto-fix issues before deploying
    """
    
    console.print("\n[bold cyan]🚀 Copilens Deployment Engine[/bold cyan]\n")
    
    # VALIDATION: Check deployment readiness
    if not skip_validation:
        console.print("[yellow]🔍 Validating deployment readiness...[/yellow]\n")
        
        validator = DeploymentValidator()
        is_ready, issues = validator.validate()
        
        validator.display_results(is_ready, issues)
        
        # Apply auto-fixes if requested
        if auto_fix and issues:
            console.print("\n[cyan]🔧 Applying automatic fixes...[/cyan]\n")
            fixed_count = validator.apply_fixes()
            console.print(f"\n[green]✓ Applied {fixed_count} automatic fix(es)[/green]\n")
            
            # Re-validate
            is_ready, issues = validator.validate()
        
        # Check if we can proceed
        has_errors = any(i.level == 'error' for i in issues)
        if has_errors and not auto:
            console.print("\n[red]❌ Deployment blocked - fix errors or use --auto-fix[/red]")
            raise typer.Exit(1)
        
        if is_ready or not has_errors:
            console.print("\n[green]✅ Validation passed! Proceeding with deployment...[/green]\n")
    
    manager = DeploymentManager()
    
    # Detect architecture
    console.print("[yellow]📊 Analyzing project...[/yellow]")
    detector = ArchitectureDetector()
    arch = detector.detect()
    
    # Display architecture
    console.print(f"[green]✓[/green] Project Type: {arch.project_type.value}")
    console.print(f"[green]✓[/green] Language: {arch.primary_language.value}")
    console.print(f"[green]✓[/green] Frameworks: {', '.join(f.value for f in arch.frameworks)}")
    
    if not platform:
        platform = arch.recommended_platform
        console.print(f"[cyan]→[/cyan] Recommended Platform: {platform}\n")
    
    # Check deployment readiness
    config_detector = ConfigDetector()
    readiness = config_detector.check_deployment_readiness()
    
    if not readiness['ready']:
        console.print("[yellow]⚠️  Project needs preparation[/yellow]\n")
        
        if readiness['missing_files']:
            console.print("Missing files:")
            for file in readiness['missing_files']:
                console.print(f"  • {file}")
        
        # Auto-generate missing files
        if auto or auto_fix:
            console.print("\n[cyan]🔧 Generating missing files...[/cyan]")
            
            # Generate Dockerfile if missing
            if 'Dockerfile' in readiness['missing_files']:
                dockerfile_content = SimpleDockerDeployer.generate_dockerfile(Path("."))
                if dockerfile_content:
                    Path("Dockerfile").write_text(dockerfile_content)
                    console.print("[green]✓[/green] Created Dockerfile")
            
            # Generate other files
            templates = config_detector.generate_missing_configs(arch.project_type.value)
            for filename, content in templates.items():
                Path(filename).write_text(content)
                console.print(f"[green]✓[/green] Created {filename}")
        else:
            console.print("\n[cyan]Run with --auto-fix to generate missing files automatically[/cyan]")
            raise typer.Exit(0)
    
    # Prepare
    if prepare_only:
        console.print("\n[green]✅ Project is deployment-ready![/green]\n")
        return
    
    # Deploy
    console.print(f"\n[bold cyan]🚀 Deploying to {platform}...[/bold cyan]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Deploying...", total=None)
        
        result = manager.deploy(platform)
        
        progress.update(task, completed=True)
    
    # Show result
    if result.status.value == "success":
        console.print(f"\n[bold green]✅ Deployment Successful![/bold green]\n")
        
        if result.url:
            console.print(Panel(
                f"[bold cyan]🌐 Live URL:[/bold cyan] [link={result.url}]{result.url}[/link]",
                title="Deployment Complete",
                border_style="green"
            ))
        
        console.print("\n[cyan]Deployment logs:[/cyan]")
        for log in result.logs:
            console.print(f"  {log}")
    else:
        console.print(f"\n[bold red]❌ Deployment Failed[/bold red]")
        console.print(f"Error: {result.error}\n")
    
    console.print()


@app.command()
def detect_arch():
    """Detect and display project architecture"""
    
    console.print("\n[bold cyan]🔍 Architecture Detection[/bold cyan]\n")
    
    detector = ArchitectureDetector()
    arch = detector.detect()
    
    # Create info table
    table = Table(title="Project Architecture", show_header=True, header_style="bold cyan")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="green")
    
    table.add_row("Project Type", arch.project_type.value)
    table.add_row("Primary Language", arch.primary_language.value)
    table.add_row("Frameworks", ', '.join(f.value for f in arch.frameworks))
    table.add_row("Has Frontend", "✓" if arch.has_frontend else "✗")
    table.add_row("Has Backend", "✓" if arch.has_backend else "✗")
    table.add_row("Has Database", "✓" if arch.has_database else "✗")
    table.add_row("Package Manager", arch.package_manager or "N/A")
    table.add_row("Build Tool", arch.build_tool or "N/A")
    table.add_row("Deployment Ready", "✓" if arch.deployment_ready else "✗")
    table.add_row("Recommended Platform", arch.recommended_platform or "N/A")
    
    console.print(table)
    
    if arch.missing_configs:
        console.print("\n[yellow]Missing configurations:[/yellow]")
        for config in arch.missing_configs:
            console.print(f"  • {config}")
    
    console.print(f"\n[cyan]Config files found: {len(arch.config_files)}[/cyan]")
    console.print()


@app.command()
def status():
    """Show deployment status"""
    
    console.print("\n[bold cyan]📊 Deployment Status[/bold cyan]\n")
    
    manager = DeploymentManager()
    deployments = manager.list_deployments()
    
    if not deployments:
        console.print("[yellow]No deployments found[/yellow]\n")
        return
    
    table = Table(show_header=True, header_style="bold cyan")
    table.add_column("Platform", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("URL")
    table.add_column("Timestamp")
    
    for dep in deployments[-5:]:  # Show last 5
        table.add_row(
            dep['platform'],
            dep['status'],
            dep.get('url', 'N/A'),
            dep['timestamp'][:19]  # Trim timestamp
        )
    
    console.print(table)
    console.print()


if __name__ == "__main__":
    app()
