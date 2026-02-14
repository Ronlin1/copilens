"""
Monitoring Commands for Copilens
"""

import typer
import time
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.live import Live
from rich.layout import Layout

from ..monitoring.health_checker import HealthChecker, HealthStatus
from ..monitoring.alerts import AlertManager, Alert, AlertSeverity, AlertChannel

console = Console()
app = typer.Typer()


@app.command()
def start(
    url: str = typer.Argument(..., help="URL to monitor"),
    interval: int = typer.Option(60, "--interval", "-i", help="Check interval in seconds"),
    duration: int = typer.Option(0, "--duration", "-d", help="Duration in minutes (0 = forever)"),
    alerts: bool = typer.Option(True, "--alerts/--no-alerts", help="Enable alerts"),
):
    """
    Start monitoring a deployed application
    
    Examples:
        copilens monitor start https://myapp.railway.app
        copilens monitor start https://myapp.vercel.app --interval 30
    """
    
    console.print(f"\n[bold cyan]📊 Starting Monitor for: {url}[/bold cyan]\n")
    
    checker = HealthChecker(url, interval)
    alert_manager = AlertManager() if alerts else None
    
    # Initial check
    console.print("[yellow]Performing initial health check...[/yellow]")
    result = checker.check_health()
    
    if result.status == HealthStatus.HEALTHY:
        console.print(f"[green]✓ {url} is healthy ({result.response_time_ms:.0f}ms)[/green]\n")
    else:
        console.print(f"[red]✗ {url} is {result.status.value}[/red]\n")
        if result.error:
            console.print(f"[red]Error: {result.error}[/red]\n")
    
    # Start monitoring loop
    console.print(f"[cyan]Monitoring every {interval}s... (Press Ctrl+C to stop)[/cyan]\n")
    
    checks_count = 0
    max_checks = (duration * 60 // interval) if duration > 0 else 999999
    
    try:
        while checks_count < max_checks:
            time.sleep(interval)
            
            result = checker.check_health()
            checks_count += 1
            
            timestamp = result.timestamp.strftime("%H:%M:%S")
            
            if result.status == HealthStatus.HEALTHY:
                console.print(
                    f"[green]{timestamp} ✓ Healthy[/green] "
                    f"({result.response_time_ms:.0f}ms, {result.status_code})"
                )
            else:
                console.print(
                    f"[red]{timestamp} ✗ {result.status.value}[/red] "
                    f"- {result.error or 'Unknown error'}"
                )
                
                # Send alert
                if alert_manager:
                    alert = Alert(
                        title=f"⚠️ {url} is {result.status.value}",
                        message=f"Status: {result.status.value}\nError: {result.error or 'Unknown'}",
                        severity=AlertSeverity.CRITICAL,
                        url=url
                    )
                    alert_manager.send_alert(alert)
            
            # Check for anomalies
            if checker.detect_anomaly():
                console.print("[yellow]  ⚠️  Anomaly detected: Response time unusually high[/yellow]")
                
                if alert_manager:
                    alert = Alert(
                        title="⚠️ Performance Degradation",
                        message=f"Response time is unusually high for {url}",
                        severity=AlertSeverity.WARNING,
                        url=url
                    )
                    alert_manager.send_alert(alert)
    
    except KeyboardInterrupt:
        console.print("\n[cyan]Monitoring stopped[/cyan]\n")
    
    # Show final stats
    stats = checker.get_stats(hours=24)
    
    console.print("\n[bold cyan]📊 Monitoring Summary[/bold cyan]\n")
    console.print(f"Total checks: {checks_count}")
    console.print(f"Uptime: {stats['uptime_percentage']:.1f}%")
    console.print(f"Avg response time: {stats['average_response_time_ms']:.0f}ms")
    console.print()


@app.command()
def status(
    url: str = typer.Argument(..., help="URL to check"),
):
    """Check current status of monitored URL"""
    
    console.print(f"\n[bold cyan]📊 Checking: {url}[/bold cyan]\n")
    
    checker = HealthChecker(url)
    result = checker.check_health()
    
    # Create status panel
    status_icon = {
        HealthStatus.HEALTHY: "✅",
        HealthStatus.DEGRADED: "⚠️",
        HealthStatus.DOWN: "❌",
        HealthStatus.UNKNOWN: "❓"
    }[result.status]
    
    status_color = {
        HealthStatus.HEALTHY: "green",
        HealthStatus.DEGRADED: "yellow",
        HealthStatus.DOWN: "red",
        HealthStatus.UNKNOWN: "white"
    }[result.status]
    
    info = f"""
[bold]{status_icon} Status:[/bold] [{status_color}]{result.status.value}[/{status_color}]
[bold]Response Time:[/bold] {result.response_time_ms:.0f}ms
[bold]Status Code:[/bold] {result.status_code or 'N/A'}
    """.strip()
    
    if result.error:
        info += f"\n[bold]Error:[/bold] [red]{result.error}[/red]"
    
    console.print(Panel(info, title="Health Check", border_style=status_color))
    
    # Show stats if available
    if len(checker.history) > 1:
        stats = checker.get_stats(hours=24)
        
        console.print(f"\n[cyan]24-Hour Statistics:[/cyan]")
        console.print(f"  Uptime: {stats['uptime_percentage']:.1f}%")
        console.print(f"  Avg Response: {stats['average_response_time_ms']:.0f}ms")
        console.print(f"  Total Checks: {stats['total_checks']}")
    
    console.print()


@app.command()
def configure_alerts(
    slack_webhook: str = typer.Option(None, "--slack", help="Slack webhook URL"),
    discord_webhook: str = typer.Option(None, "--discord", help="Discord webhook URL"),
    custom_webhook: str = typer.Option(None, "--webhook", help="Custom webhook URL"),
):
    """Configure alert notifications"""
    
    console.print("\n[bold cyan]🔔 Configuring Alerts[/bold cyan]\n")
    
    manager = AlertManager()
    
    if slack_webhook:
        manager.configure_slack(slack_webhook)
        console.print("[green]✓ Slack configured[/green]")
    
    if discord_webhook:
        manager.configure_discord(discord_webhook)
        console.print("[green]✓ Discord configured[/green]")
    
    if custom_webhook:
        manager.configure_webhook(custom_webhook)
        console.print("[green]✓ Custom webhook configured[/green]")
    
    if not any([slack_webhook, discord_webhook, custom_webhook]):
        console.print("[yellow]No alerts configured. Use --slack, --discord, or --webhook[/yellow]")
    
    console.print("\n[cyan]Alerts will be sent to configured channels when issues are detected[/cyan]\n")


if __name__ == "__main__":
    app()
