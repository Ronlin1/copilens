"""Full Agentic Core - Autonomous AI Agent System"""
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from datetime import datetime
from pathlib import Path
import json
from pydantic import BaseModel, Field


class AgentState(str, Enum):
    """Agent operational states"""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    LEARNING = "learning"
    OBSERVING = "observing"
    FAILED = "failed"
    COMPLETED = "completed"


class AgentGoal(BaseModel):
    """Agent goal definition"""
    id: str
    description: str
    target_metric: str
    target_value: float
    current_value: float = 0.0
    priority: int = 1
    deadline: Optional[datetime] = None
    constraints: List[str] = Field(default_factory=list)
    
    def progress(self) -> float:
        """Calculate goal progress percentage"""
        if self.target_value == 0:
            return 0.0
        return min(100.0, (self.current_value / self.target_value) * 100)
    
    def is_achieved(self) -> bool:
        """Check if goal is achieved"""
        return self.current_value >= self.target_value


class AgentAction(BaseModel):
    """Single agent action"""
    id: str
    type: str
    tool: str
    parameters: Dict[str, Any]
    reasoning: str
    expected_outcome: str
    executed: bool = False
    result: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class AgentPlan(BaseModel):
    """Multi-step agent plan"""
    id: str
    goal_id: str
    steps: List[AgentAction]
    created_at: datetime = Field(default_factory=datetime.now)
    status: str = "pending"
    
    def next_action(self) -> Optional[AgentAction]:
        """Get next unexecuted action"""
        for action in self.steps:
            if not action.executed:
                return action
        return None
    
    def progress(self) -> float:
        """Calculate plan progress"""
        if not self.steps:
            return 0.0
        executed = sum(1 for s in self.steps if s.executed)
        return (executed / len(self.steps)) * 100


class AgentMemory(BaseModel):
    """Agent memory entry"""
    id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    type: str  # observation, action, feedback, learning
    content: Dict[str, Any]
    embedding: Optional[List[float]] = None
    importance: float = 0.5
    tags: List[str] = Field(default_factory=list)


class AgentThought(BaseModel):
    """Agent reasoning/thought"""
    observation: str
    reasoning: str
    action: str
    confidence: float


class AutonomousAgent:
    """
    Full Agentic System - ReAct Pattern Implementation
    
    Capabilities:
    - Autonomous goal pursuit
    - Multi-step planning
    - Tool orchestration
    - Self-learning
    - Proactive actions
    """
    
    def __init__(
        self,
        name: str = "Copilens Agent",
        memory_path: Optional[Path] = None
    ):
        self.name = name
        self.state = AgentState.IDLE
        self.goals: List[AgentGoal] = []
        self.current_goal: Optional[AgentGoal] = None
        self.plans: List[AgentPlan] = []
        self.current_plan: Optional[AgentPlan] = None
        self.memories: List[AgentMemory] = []
        self.tools: Dict[str, Callable] = {}
        self.memory_path = memory_path or Path.home() / ".copilens" / "agent_memory.json"
        self.load_memory()
    
    def set_goal(self, goal: AgentGoal) -> None:
        """Set a new goal for the agent"""
        self.goals.append(goal)
        self.current_goal = goal
        self.state = AgentState.PLANNING
        
        # Store in memory
        self.remember(
            type="goal",
            content=goal.model_dump(),
            importance=1.0,
            tags=["goal", "planning"]
        )
    
    def think(self, observation: str) -> AgentThought:
        """
        ReAct Pattern: Reason about observation and decide action
        
        1. Observe current state
        2. Reason about what to do
        3. Decide on action
        """
        # Simple rule-based reasoning (can be enhanced with LLM)
        reasoning = self._reason_about_observation(observation)
        action = self._decide_action(reasoning)
        confidence = self._calculate_confidence(observation, reasoning, action)
        
        return AgentThought(
            observation=observation,
            reasoning=reasoning,
            action=action,
            confidence=confidence
        )
    
    def plan(self, goal: AgentGoal) -> AgentPlan:
        """
        Create a multi-step plan to achieve goal
        
        Planning Strategy:
        1. Analyze current state
        2. Decompose goal into sub-goals
        3. Create action sequence
        4. Add error handling
        """
        self.state = AgentState.PLANNING
        
        # Generate plan based on goal type
        steps = self._generate_plan_steps(goal)
        
        plan = AgentPlan(
            id=f"plan_{datetime.now().timestamp()}",
            goal_id=goal.id,
            steps=steps
        )
        
        self.plans.append(plan)
        self.current_plan = plan
        
        # Remember the plan
        self.remember(
            type="plan",
            content=plan.model_dump(),
            importance=0.9,
            tags=["plan", goal.description]
        )
        
        return plan
    
    def execute(self, action: AgentAction) -> Dict[str, Any]:
        """
        Execute a single action using registered tools
        """
        self.state = AgentState.EXECUTING
        
        if action.tool not in self.tools:
            return {
                "success": False,
                "error": f"Tool '{action.tool}' not registered"
            }
        
        try:
            # Execute tool
            tool_func = self.tools[action.tool]
            result = tool_func(**action.parameters)
            
            # Mark as executed
            action.executed = True
            action.result = result
            action.timestamp = datetime.now()
            
            # Learn from result
            self.learn_from_action(action, result)
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_autonomous(self, max_iterations: int = 100) -> Dict[str, Any]:
        """
        Run agent autonomously until goal achieved or max iterations
        
        Main Agent Loop:
        1. Observe environment
        2. Think/Reason
        3. Plan if needed
        4. Execute action
        5. Learn from result
        6. Repeat
        """
        iteration = 0
        results = {
            "iterations": 0,
            "actions_taken": [],
            "goal_achieved": False,
            "final_state": {}
        }
        
        while iteration < max_iterations:
            iteration += 1
            
            # Check if goal achieved
            if self.current_goal and self.current_goal.is_achieved():
                results["goal_achieved"] = True
                self.state = AgentState.COMPLETED
                break
            
            # If no plan, create one
            if not self.current_plan and self.current_goal:
                self.current_plan = self.plan(self.current_goal)
            
            # Get next action
            if self.current_plan:
                next_action = self.current_plan.next_action()
                
                if next_action:
                    # Think about the action
                    thought = self.think(f"About to execute: {next_action.type}")
                    
                    # Execute
                    result = self.execute(next_action)
                    results["actions_taken"].append({
                        "action": next_action.type,
                        "result": result,
                        "thought": thought.model_dump()
                    })
                    
                    # Update goal progress if possible
                    if self.current_goal and result.get("success"):
                        self._update_goal_progress(result)
                else:
                    # Plan complete, check if goal achieved
                    if self.current_goal and not self.current_goal.is_achieved():
                        # Create new plan
                        self.current_plan = self.plan(self.current_goal)
                    else:
                        break
            else:
                break
            
            self.state = AgentState.OBSERVING
        
        results["iterations"] = iteration
        results["final_state"] = {
            "state": self.state.value,
            "goal_progress": self.current_goal.progress() if self.current_goal else 0,
            "plan_progress": self.current_plan.progress() if self.current_plan else 0
        }
        
        return results
    
    def learn_from_action(self, action: AgentAction, result: Dict[str, Any]) -> None:
        """
        Learn from action results to improve future performance
        
        Learning Strategies:
        1. Success/failure patterns
        2. Effective tool combinations
        3. Parameter optimization
        4. Error avoidance
        """
        self.state = AgentState.LEARNING
        
        # Store learning
        learning = {
            "action_type": action.type,
            "tool": action.tool,
            "success": result.get("success", False),
            "outcome": result,
            "reasoning": action.reasoning
        }
        
        self.remember(
            type="learning",
            content=learning,
            importance=0.8 if result.get("success") else 0.9,
            tags=["learning", action.type, "success" if result.get("success") else "failure"]
        )
    
    def remember(
        self,
        type: str,
        content: Dict[str, Any],
        importance: float = 0.5,
        tags: List[str] = None
    ) -> None:
        """Store information in agent memory"""
        memory = AgentMemory(
            id=f"mem_{datetime.now().timestamp()}",
            type=type,
            content=content,
            importance=importance,
            tags=tags or []
        )
        
        self.memories.append(memory)
        
        # Keep only most important memories (limit to 1000)
        if len(self.memories) > 1000:
            self.memories.sort(key=lambda m: m.importance, reverse=True)
            self.memories = self.memories[:1000]
        
        # Persist to disk
        self.save_memory()
    
    def recall(
        self,
        query: str = None,
        type: str = None,
        tags: List[str] = None,
        limit: int = 10
    ) -> List[AgentMemory]:
        """Retrieve memories from storage"""
        results = self.memories
        
        if type:
            results = [m for m in results if m.type == type]
        
        if tags:
            results = [m for m in results if any(tag in m.tags for tag in tags)]
        
        # Sort by importance and recency
        results.sort(key=lambda m: (m.importance, m.timestamp), reverse=True)
        
        return results[:limit]
    
    def register_tool(self, name: str, func: Callable, description: str = "") -> None:
        """Register a tool that the agent can use"""
        self.tools[name] = func
    
    def save_memory(self) -> None:
        """Persist memory to disk"""
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            "goals": [g.model_dump() for g in self.goals],
            "plans": [p.model_dump() for p in self.plans],
            "memories": [m.model_dump() for m in self.memories[-500:]]  # Last 500
        }
        
        with open(self.memory_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def load_memory(self) -> None:
        """Load memory from disk"""
        if not self.memory_path.exists():
            return
        
        try:
            with open(self.memory_path, 'r') as f:
                data = json.load(f)
            
            # Restore goals
            for goal_data in data.get("goals", []):
                self.goals.append(AgentGoal(**goal_data))
            
            # Restore memories
            for mem_data in data.get("memories", []):
                self.memories.append(AgentMemory(**mem_data))
                
        except Exception as e:
            print(f"Warning: Could not load memory: {e}")
    
    def _reason_about_observation(self, observation: str) -> str:
        """Reason about observation (simple rule-based for now)"""
        # Check past experiences
        similar_memories = self.recall(tags=["learning"], limit=5)
        
        if "error" in observation.lower():
            return "Detected error condition. Should investigate and apply fix."
        elif "high-risk" in observation.lower():
            return "High risk detected. Should run security scan and suggest fixes."
        elif "complete" in observation.lower():
            return "Action completed successfully. Should proceed to next step."
        else:
            return f"Observing: {observation}. Should continue with planned actions."
    
    def _decide_action(self, reasoning: str) -> str:
        """Decide action based on reasoning"""
        if "error" in reasoning.lower():
            return "investigate_error"
        elif "security" in reasoning.lower():
            return "run_security_scan"
        elif "fix" in reasoning.lower():
            return "apply_fix"
        elif "proceed" in reasoning.lower():
            return "continue_plan"
        else:
            return "observe"
    
    def _calculate_confidence(
        self,
        observation: str,
        reasoning: str,
        action: str
    ) -> float:
        """Calculate confidence in decision"""
        # Check if we've done similar actions before
        similar_actions = self.recall(tags=["learning", action], limit=10)
        
        if not similar_actions:
            return 0.5  # Moderate confidence for new actions
        
        # Calculate success rate
        successes = sum(
            1 for m in similar_actions
            if m.content.get("success", False)
        )
        
        return successes / len(similar_actions) if similar_actions else 0.5
    
    def _generate_plan_steps(self, goal: AgentGoal) -> List[AgentAction]:
        """Generate action steps for a goal"""
        steps = []
        
        # Common goal patterns
        if "reduce" in goal.description.lower() and "risk" in goal.description.lower():
            steps = [
                AgentAction(
                    id="step_1",
                    type="analyze",
                    tool="analyze_repository",
                    parameters={},
                    reasoning="First analyze current state to identify risks",
                    expected_outcome="List of high-risk files"
                ),
                AgentAction(
                    id="step_2",
                    type="scan",
                    tool="security_scan",
                    parameters={},
                    reasoning="Scan for security vulnerabilities",
                    expected_outcome="Security vulnerability report"
                ),
                AgentAction(
                    id="step_3",
                    type="fix",
                    tool="apply_fixes",
                    parameters={"auto_fix": True},
                    reasoning="Automatically fix identified issues",
                    expected_outcome="Fixed code with reduced risk"
                ),
                AgentAction(
                    id="step_4",
                    type="verify",
                    tool="verify_fixes",
                    parameters={},
                    reasoning="Verify that fixes worked and risk reduced",
                    expected_outcome="Confirmation of risk reduction"
                )
            ]
        
        elif "improve" in goal.description.lower() and "quality" in goal.description.lower():
            steps = [
                AgentAction(
                    id="step_1",
                    type="analyze",
                    tool="quality_analysis",
                    parameters={},
                    reasoning="Analyze current code quality metrics",
                    expected_outcome="Quality score and issues"
                ),
                AgentAction(
                    id="step_2",
                    type="refactor",
                    tool="suggest_refactoring",
                    parameters={},
                    reasoning="Identify refactoring opportunities",
                    expected_outcome="Refactoring suggestions"
                ),
                AgentAction(
                    id="step_3",
                    type="test",
                    tool="generate_tests",
                    parameters={},
                    reasoning="Generate missing tests",
                    expected_outcome="New test coverage"
                )
            ]
        
        else:
            # Generic plan
            steps = [
                AgentAction(
                    id="step_1",
                    type="analyze",
                    tool="analyze_repository",
                    parameters={},
                    reasoning="Analyze current state",
                    expected_outcome="Current state analysis"
                )
            ]
        
        return steps
    
    def _update_goal_progress(self, result: Dict[str, Any]) -> None:
        """Update goal progress based on action result"""
        if not self.current_goal:
            return
        
        # Update based on result metrics
        if "risk_reduction" in result:
            self.current_goal.current_value += result["risk_reduction"]
        elif "quality_improvement" in result:
            self.current_goal.current_value += result["quality_improvement"]
        elif "success" in result and result["success"]:
            # Generic progress increment
            total_steps = len(self.current_plan.steps) if self.current_plan else 1
            self.current_goal.current_value += (100 / total_steps)
