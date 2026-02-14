"""Agent command - Autonomous agent operations"""
import typer
from rich.console import Console
from rich.panel import Panel
from rich.live import Live
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from copilens.agentic.core import AutonomousAgent, AgentGoal, AgentState
from copilens.agentic.tools import AgentToolRegistry
from copilens.ui.output import print_success, print_error, print_info, print_warning
import time

console = Console()


def agent_command(
    goal: str = typer.Argument(..., help="Agent goal (e.g., 'reduce-risk', 'improve-quality')"),
    auto: bool = typer.Option(False, "--auto", help="Run autonomously without confirmation"),
    max_iterations: int = typer.Option(50, "--max-iterations", help="Maximum iterations"),
    path: str = typer.Option(".", help="Repository path")
):
    """🤖 Start autonomous agent to achieve goals"""
    
    console.print(Panel(
        "[bold cyan]Copilens Autonomous Agent[/bold cyan]\n\n"
        "The agent will autonomously:\n"
        "  🎯 Plan multi-step actions\n"
        "  🔄 Execute using registered tools\n"
        "  🧠 Learn from results\n"
        "  📈 Track progress toward goal\n"
        "  💾 Remember past experiences",
        title="🤖 Full Agentic Mode",
        border_style="cyan"
    ))
    
    # Initialize agent
    agent = AutonomousAgent(name="Copilens Agent")
    
    # Register tools
    tool_registry = AgentToolRegistry(repo_path=path)
    for tool_name, tool_func in tool_registry.tools.items():
        agent.register_tool(tool_name, tool_func)
    
    print_success(f"Agent initialized with {len(agent.tools)} tools")
    
    # Parse goal
    agent_goal = _parse_goal(goal)
    
    if not agent_goal:
        print_error(f"Unknown goal: {goal}")
        print_info("Available goals: reduce-risk, improve-quality, analyze, fix-security")
        raise typer.Exit(1)
    
    # Set goal
    agent.set_goal(agent_goal)
    
    console.print(f"\n[bold]Goal:[/bold] {agent_goal.description}")
    console.print(f"[bold]Target:[/bold] {agent_goal.target_metric} = {agent_goal.target_value}")
    console.print()
    
    if not auto:
        confirm = typer.confirm("Start autonomous agent execution?")
        if not confirm:
            print_warning("Agent execution cancelled")
            raise typer.Exit(0)
    
    # Run agent
    print_success("🚀 Starting autonomous agent...\n")
    
    with Live(_create_status_table(agent), refresh_per_second=2, console=console) as live:
        # Run in background, update live display
        results = agent.run_autonomous(max_iterations=max_iterations)
        
        # Update final display
        live.update(_create_status_table(agent, final=True))
    
    # Display results
    _display_results(agent, results)


def agent_status_command(
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show detailed status")
):
    """Show agent status and memory"""
    
    agent = AutonomousAgent()
    agent.load_memory()
    
    console.print("\n[bold cyan]Agent Status[/bold cyan]\n")
    console.print(f"State: [{_state_color(agent.state)}]{agent.state.value.upper()}[/{_state_color(agent.state)}]")
    console.print(f"Goals: {len(agent.goals)}")
    console.print(f"Plans: {len(agent.plans)}")
    console.print(f"Memories: {len(agent.memories)}")
    console.print(f"Tools: {len(agent.tools)}")
    
    if agent.current_goal:
        console.print(f"\n[bold]Current Goal:[/bold]")
        console.print(f"  {agent.current_goal.description}")
        console.print(f"  Progress: {agent.current_goal.progress():.1f}%")
    
    if verbose and agent.memories:
        console.print("\n[bold]Recent Memories:[/bold]")
        recent = agent.recall(limit=5)
        for mem in recent:
            console.print(f"  [{mem.type}] {mem.timestamp.strftime('%Y-%m-%d %H:%M')} - Importance: {mem.importance}")


def agent_memory_command(
    clear: bool = typer.Option(False, "--clear", help="Clear agent memory"),
    type: str = typer.Option(None, "--type", help="Filter by type")
):
    """Manage agent memory"""
    
    agent = AutonomousAgent()
    
    if clear:
        confirm = typer.confirm("⚠️  Clear all agent memory?")
        if confirm:
            agent.memories.clear()
            agent.save_memory()
            print_success("Agent memory cleared")
    else:
        memories = agent.recall(type=type, limit=20)
        
        table = Table(title="Agent Memory")
        table.add_column("Time", style="cyan")
        table.add_column("Type", style="yellow")
        table.add_column("Importance", style="magenta")
        table.add_column("Tags", style="green")
        
        for mem in memories:
            table.add_row(
                mem.timestamp.strftime("%Y-%m-%d %H:%M"),
                mem.type,
                f"{mem.importance:.2f}",
                ", ".join(mem.tags[:3])
            )
        
        console.print(table)


def _parse_goal(goal_str: str) -> AgentGoal:
    """Parse goal string into AgentGoal"""
    
    goals_map = {
        "reduce-risk": AgentGoal(
            id="goal_reduce_risk",
            description="Reduce repository risk score",
            target_metric="risk_reduction",
            target_value=100.0,
            priority=1
        ),
        "improve-quality": AgentGoal(
            id="goal_improve_quality",
            description="Improve code quality score",
            target_metric="quality_improvement",
            target_value=100.0,
            priority=1
        ),
        "analyze": AgentGoal(
            id="goal_analyze",
            description="Analyze repository comprehensively",
            target_metric="analysis_complete",
            target_value=100.0,
            priority=2
        ),
        "fix-security": AgentGoal(
            id="goal_fix_security",
            description="Fix security vulnerabilities",
            target_metric="vulnerabilities_fixed",
            target_value=100.0,
            priority=1
        )
    }
    
    return goals_map.get(goal_str.lower())


def _create_status_table(agent: AutonomousAgent, final: bool = False) -> Table:
    """Create live status table"""
    
    table = Table(title="🤖 Agent Status" if not final else "✅ Agent Complete")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    
    state_color = _state_color(agent.state)
    table.add_row("State", f"[{state_color}]{agent.state.value.upper()}[/{state_color}]")
    
    if agent.current_goal:
        progress = agent.current_goal.progress()
        table.add_row("Goal Progress", f"{progress:.1f}%")
        table.add_row("Goal", agent.current_goal.description)
    
    if agent.current_plan:
        plan_progress = agent.current_plan.progress()
        table.add_row("Plan Progress", f"{plan_progress:.1f}%")
        table.add_row("Steps Complete", f"{sum(1 for s in agent.current_plan.steps if s.executed)}/{len(agent.current_plan.steps)}")
    
    table.add_row("Memories", str(len(agent.memories)))
    
    return table


def _state_color(state: AgentState) -> str:
    """Get color for agent state"""
    colors = {
        AgentState.IDLE: "dim",
        AgentState.PLANNING: "yellow",
        AgentState.EXECUTING: "cyan",
        AgentState.LEARNING: "magenta",
        AgentState.OBSERVING: "blue",
        AgentState.FAILED: "red",
        AgentState.COMPLETED: "green"
    }
    return colors.get(state, "white")


def _display_results(agent: AutonomousAgent, results: dict):
    """Display final results"""
    
    console.print("\n" + "="*70)
    console.print("[bold green]Agent Execution Complete![/bold green]")
    console.print("="*70 + "\n")
    
    console.print(f"[bold]Iterations:[/bold] {results['iterations']}")
    console.print(f"[bold]Actions Taken:[/bold] {len(results['actions_taken'])}")
    console.print(f"[bold]Goal Achieved:[/bold] {'✅ Yes' if results['goal_achieved'] else '❌ No'}")
    
    if agent.current_goal:
        console.print(f"[bold]Final Progress:[/bold] {agent.current_goal.progress():.1f}%")
    
    console.print(f"\n[bold cyan]Actions Executed:[/bold cyan]")
    for i, action in enumerate(results['actions_taken'], 1):
        success = action['result'].get('success', False)
        icon = "✅" if success else "❌"
        console.print(f"  {i}. {icon} {action['action']} - {action['thought']['reasoning'][:50]}...")
    
    console.print(f"\n[bold]Final State:[/bold] {results['final_state']['state']}")
    
    # Show what was learned
    learnings = agent.recall(type="learning", limit=3)
    if learnings:
        console.print(f"\n[bold magenta]Agent Learnings:[/bold magenta]")
        for learning in learnings:
            success = learning.content.get('success', False)
            console.print(f"  {'✅' if success else '❌'} {learning.content.get('action_type', 'Unknown')}")
