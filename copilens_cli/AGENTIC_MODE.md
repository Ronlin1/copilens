# 🤖 Full Agentic Mode - User Guide

## What is Full Agentic Mode?

Copilens now features a **truly autonomous AI agent** that can:

✅ Set and pursue goals independently
✅ Plan multi-step actions autonomously  
✅ Execute tools without human intervention
✅ Learn from successes and failures
✅ Remember past experiences (persistent memory)
✅ Adapt strategy based on results
✅ Run continuously until goals achieved

## 🎯 How It Works

### ReAct Pattern (Reasoning + Acting)

```
1. OBSERVE → What's the current state?
2. THINK → What should I do about it?
3. PLAN → Break goal into steps
4. ACT → Execute using tools
5. LEARN → Store what worked/failed
6. REPEAT → Continue until goal achieved
```

### Agent Loop

```python
while not goal_achieved:
    observation = observe_environment()
    thought = think(observation)  # Reason about what to do
    action = decide_action(thought)  
    result = execute(action)  # Use registered tools
    learn(action, result)  # Store in memory
    update_progress()
```

## 🚀 Usage Examples

### Example 1: Reduce Repository Risk (Autonomous)

```bash
# Agent will autonomously work to reduce risk
copilens agent reduce-risk --auto

🤖 Copilens Autonomous Agent
══════════════════════════════════════
Goal: Reduce repository risk score
Target: risk_reduction = 100.0

🚀 Starting autonomous agent...

[Agent] State: PLANNING
[Agent] Creating 4-step plan...
  Step 1: Analyze repository
  Step 2: Security scan
  Step 3: Apply fixes
  Step 4: Verify fixes

[Agent] State: EXECUTING
[Agent] Executing: analyze_repository
  ✅ Found 15 high-risk files
  ✅ Total risk: 4.2/5.0

[Agent] Executing: security_scan
  ✅ Found 3 vulnerabilities
  ⚠️  SQL injection in auth.py
  ⚠️  Hardcoded API key in config.py

[Agent] State: LEARNING
[Agent] Learning from results...
  ✅ Security scan effective
  💾 Stored in memory

[Agent] Executing: apply_fixes
  ✅ Fixes applied
  📈 Risk reduced by 20%

[Agent] Executing: verify_fixes
  ✅ Fixes verified
  📊 Current risk: 3.1/5.0

[Agent] Goal Progress: 85%
[Agent] State: PLANNING
[Agent] Creating new plan...

... continues autonomously ...

✅ Agent Execution Complete!
══════════════════════════════════════
Iterations: 12
Actions Taken: 8
Goal Achieved: ✅ Yes
Final Progress: 100.0%
```

### Example 2: Improve Code Quality

```bash
copilens agent improve-quality

Goal: Improve code quality score
Target: quality_improvement = 100.0

[Agent] Analyzing code quality...
[Agent] Found 12 quality issues
[Agent] Suggesting refactoring...
[Agent] Generating tests...
[Agent] Quality improved by 75%
```

### Example 3: Security Focus

```bash
copilens agent fix-security --max-iterations 30

[Agent] Scanning for vulnerabilities...
[Agent] Found 5 security issues
[Agent] Applying security fixes...
[Agent] Verifying fixes...
[Agent] All vulnerabilities fixed!
```

## 📊 Agent Status & Memory

### Check Agent Status

```bash
copilens agent-status

Agent Status
══════════════════════════════
State: IDLE
Goals: 3
Plans: 5
Memories: 247
Tools: 10

Current Goal: Reduce repository risk
Progress: 73.5%
```

### View Agent Memory

```bash
copilens agent-memory

Agent Memory
══════════════════════════════════════════
Time              Type      Importance  Tags
2026-02-14 13:00  learning  0.90       security, success
2026-02-14 12:58  plan      0.85       reduce-risk
2026-02-14 12:55  goal      1.00       goal, planning
```

### Clear Memory

```bash
copilens agent-memory --clear
```

## 🛠️ Available Tools

The agent has access to these tools:

### Analysis Tools
- `analyze_repository` - Full repo analysis
- `ai_detection` - Deep AI pattern analysis
- `security_scan` - Vulnerability scanning
- `quality_analysis` - Code quality metrics

### Action Tools
- `apply_fixes` - Automated fixes
- `verify_fixes` - Verify fixes worked
- `suggest_refactoring` - Refactoring suggestions
- `generate_tests` - Test generation

### Reporting Tools
- `create_report` - Generate reports
- `export_metrics` - Export data

## 🎯 Supported Goals

### 1. `reduce-risk`
Autonomous goal to reduce repository risk score
- Analyzes high-risk files
- Runs security scans
- Applies automated fixes
- Verifies improvements

### 2. `improve-quality`
Improve overall code quality
- Quality analysis
- Refactoring suggestions
- Test generation
- Complexity reduction

### 3. `analyze`
Comprehensive repository analysis
- Full AI detection
- Risk assessment
- Quality metrics
- Detailed reporting

### 4. `fix-security`
Focus on security vulnerabilities
- Deep security scanning
- Vulnerability fixes
- Security verification

## 🧠 How Agent Learns

### Learning Mechanisms

1. **Success/Failure Tracking**
   - Stores which actions worked
   - Remembers what failed
   - Adjusts confidence scores

2. **Pattern Recognition**
   - Identifies effective tool combinations
   - Learns parameter optimization
   - Recognizes common scenarios

3. **Persistent Memory**
   - Saves to `~/.copilens/agent_memory.json`
   - Loads past experiences
   - Continuous improvement

### Example Learning

```bash
# First time: Low confidence
[Agent] action: security_scan
[Agent] confidence: 0.5 (no past experience)
[Agent] result: ✅ Success

# Stored in memory
[Memory] security_scan → success (importance: 0.8)

# Next time: Higher confidence
[Agent] action: security_scan
[Agent] confidence: 1.0 (100% success rate)
```

## ⚙️ Advanced Configuration

### Custom Goals

```python
from copilens.agentic.core import AgentGoal

custom_goal = AgentGoal(
    id="custom_goal",
    description="Custom objective",
    target_metric="custom_metric",
    target_value=100.0,
    priority=1,
    constraints=["no-breaking-changes"]
)
```

### Register Custom Tools

```python
from copilens.agentic.core import AutonomousAgent

agent = AutonomousAgent()

def my_custom_tool(**kwargs):
    # Custom logic
    return {"success": True, "data": "..."}

agent.register_tool("my_tool", my_custom_tool)
```

## 🔄 Agent States

- **IDLE** - Waiting for goal
- **PLANNING** - Creating action plan
- **EXECUTING** - Running tools
- **LEARNING** - Storing experiences
- **OBSERVING** - Monitoring state
- **COMPLETED** - Goal achieved
- **FAILED** - Encountered error

## 💡 Best Practices

### DO:
✅ Start with `--auto` for hands-off operation
✅ Monitor agent-status periodically
✅ Review agent memory to understand learnings
✅ Let agent run to completion
✅ Use appropriate max-iterations

### DON'T:
❌ Interrupt agent mid-execution
❌ Clear memory unless necessary
❌ Set unrealistic goals
❌ Use too low max-iterations
❌ Ignore agent learnings

## 🆚 Comparison: Modes

| Feature | Manual | Agent Mode | Copilot Agent | Full Agentic |
|---------|--------|------------|---------------|--------------|
| Human Control | Full | Partial | Partial | Minimal |
| Autonomous Planning | ❌ | ❌ | ❌ | ✅ |
| Multi-Step Execution | ❌ | ❌ | ⚠️ | ✅ |
| Self-Learning | ❌ | ❌ | ❌ | ✅ |
| Persistent Memory | ❌ | ❌ | ❌ | ✅ |
| Goal Pursuit | ❌ | ❌ | ❌ | ✅ |
| Tool Orchestration | ❌ | ❌ | ⚠️ | ✅ |

## 🎓 Example Workflow

```bash
# 1. Check current state
copilens stats

# 2. Set agent goal
copilens agent reduce-risk --auto

# 3. Monitor progress
copilens agent-status

# 4. Review what agent learned
copilens agent-memory --type learning

# 5. Verify results
copilens stats

# 6. Export findings
copilens export report.json
```

## 🔮 Future Enhancements

- [ ] LLM-powered reasoning (GPT-4 integration)
- [ ] Vector database for semantic memory
- [ ] Multi-agent collaboration
- [ ] Natural language goal setting
- [ ] Autonomous PR creation
- [ ] Self-healing code
- [ ] Predictive maintenance
- [ ] Custom agent training

## 🆘 Troubleshooting

### Agent Not Making Progress
- Check agent-status for current state
- Review last action in memory
- Increase max-iterations
- Verify tools are working

### Agent Making Wrong Decisions
- Review agent learnings
- Clear memory if corrupted
- Adjust goal parameters
- Add more specific constraints

### Memory Issues
- Check memory file: `~/.copilens/agent_memory.json`
- Clear old memories
- Verify JSON is valid

## 📚 Learn More

- **Core Implementation**: `src/copilens/agentic/core.py`
- **Tool Registry**: `src/copilens/agentic/tools.py`
- **Commands**: `src/copilens/commands/agent.py`

---

**🤖 Copilens is now truly agentic - it doesn't just analyze, it autonomously improves your code!**
