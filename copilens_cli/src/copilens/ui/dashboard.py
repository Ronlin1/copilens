"""Rich UI dashboard components"""
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, BarColumn, TextColumn
from rich.layout import Layout
from rich.live import Live
from copilens.analyzers.metrics import AggregateMetrics, FileMetrics
from typing import List


console = Console()


class Dashboard:
    """Main dashboard UI"""
    
    def __init__(self):
        self.console = console
    
    def show_summary(self, metrics: AggregateMetrics) -> None:
        """Display summary metrics"""
        
        # Create metrics table
        table = Table(title="Copilens Metrics", show_header=False, box=None)
        table.add_column("Metric", style="cyan", width=25)
        table.add_column("Value", style="magenta bold")
        
        # AI Contribution with bar
        ai_percent = int(metrics.average_ai_percentage * 100)
        ai_bar = "█" * (ai_percent // 10) + "░" * (10 - ai_percent // 10)
        table.add_row("AI Contribution", f"{ai_bar} {ai_percent}%")
        
        # Risk Score with bar
        risk_bars = int(metrics.average_risk_score)
        risk_bar = "█" * risk_bars + "░" * (5 - risk_bars)
        risk_color = self._get_risk_color(metrics.average_risk_score)
        table.add_row("Risk Score", f"[{risk_color}]{risk_bar} {metrics.average_risk_score} / 5[/{risk_color}]")
        
        # Complexity Delta
        complexity_symbol = "↑" if metrics.total_complexity_delta > 0 else "↓"
        complexity_color = "red" if metrics.total_complexity_delta > 10 else "yellow" if metrics.total_complexity_delta > 0 else "green"
        table.add_row("Complexity Δ", f"[{complexity_color}]{complexity_symbol} {abs(metrics.total_complexity_delta)}[/{complexity_color}]")
        
        # Files Impacted
        table.add_row("Files Impacted", str(metrics.total_files))
        
        # Lines Changed
        table.add_row("Lines Added", f"[green]+{metrics.total_added_lines}[/green]")
        table.add_row("Lines Deleted", f"[red]-{metrics.total_deleted_lines}[/red]")
        
        # High Risk Files
        if metrics.high_risk_files > 0:
            table.add_row("High Risk Files", f"[red bold]{metrics.high_risk_files}[/red bold]")
        
        panel = Panel(table, title="[bold]Copilens Dashboard[/bold]", border_style="blue")
        self.console.print(panel)
    
    def show_file_breakdown(self, file_metrics: List[FileMetrics]) -> None:
        """Display file-by-file breakdown"""
        table = Table(title="File Analysis", show_header=True)
        table.add_column("File", style="cyan", no_wrap=False, width=40)
        table.add_column("AI %", justify="right", style="magenta")
        table.add_column("Complexity", justify="right")
        table.add_column("Risk", justify="center")
        
        # Sort by risk score descending
        sorted_metrics = sorted(file_metrics, key=lambda x: x.risk_score, reverse=True)
        
        for metric in sorted_metrics[:15]:  # Show top 15
            ai_percent = f"{int(metric.ai_percentage * 100)}%"
            complexity = f"{metric.complexity:+d}" if metric.complexity != 0 else "0"
            
            risk_color = self._get_risk_color(metric.risk_score)
            risk_display = f"[{risk_color}]{metric.risk_level.upper()}[/{risk_color}]"
            
            table.add_row(
                metric.file_path,
                ai_percent,
                complexity,
                risk_display
            )
        
        self.console.print(table)
    
    def _get_risk_color(self, risk_score: float) -> str:
        """Get color for risk score"""
        if risk_score >= 4.0:
            return "red bold"
        elif risk_score >= 3.0:
            return "red"
        elif risk_score >= 2.0:
            return "yellow"
        else:
            return "green"
    
    def show_progress(self, current: int, total: int, description: str) -> None:
        """Show progress bar"""
        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        ) as progress:
            task = progress.add_task(description, total=total)
            progress.update(task, completed=current)
