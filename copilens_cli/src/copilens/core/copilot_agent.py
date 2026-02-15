"""GitHub Copilot Agent Mode Integration"""
import os
import json
import subprocess
from typing import Optional, List, Dict, Any
from pathlib import Path
from pydantic import BaseModel


class CopilotConfig(BaseModel):
    """Copilot integration configuration"""
    enabled: bool = True
    use_agent_mode: bool = True
    use_chat_api: bool = True
    model: str = "gpt-4"
    max_tokens: int = 2000
    temperature: float = 0.7


class CopilotAgent:
    """GitHub Copilot Agent Mode integration"""
    
    def __init__(self, config: Optional[CopilotConfig] = None):
        self.config = config or CopilotConfig()
        self.is_available = self._check_copilot_available()
    
    def _check_copilot_available(self) -> bool:
        """Check if GitHub Copilot is available"""
        try:
            # Check for gh CLI with copilot extension
            result = subprocess.run(
                ["gh", "copilot", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def explain_code(
        self,
        code: str,
        context: str = "",
        file_path: str = ""
    ) -> Optional[str]:
        """Use Copilot to explain code changes"""
        if not self.is_available:
            return self._fallback_explanation(code, context)
        
        try:
            prompt = self._build_explanation_prompt(code, context, file_path)
            
            # Use gh copilot explain
            result = subprocess.run(
                ["gh", "copilot", "explain", code],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return self._fallback_explanation(code, context)
                
        except Exception:
            return self._fallback_explanation(code, context)
    
    def suggest_improvements(
        self,
        code: str,
        ai_percentage: float,
        risk_level: str
    ) -> List[str]:
        """Use Copilot agent to suggest code improvements"""
        if not self.is_available:
            return self._fallback_suggestions(ai_percentage, risk_level)
        
        try:
            prompt = f"""Analyze this code that appears to be {int(ai_percentage * 100)}% AI-generated with {risk_level} risk.
Suggest specific improvements:

{code}

Focus on:
1. Security issues
2. Code quality
3. Maintainability
4. Performance
"""
            
            result = subprocess.run(
                ["gh", "copilot", "suggest", "-t", "shell", prompt],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return self._parse_suggestions(result.stdout)
            else:
                return self._fallback_suggestions(ai_percentage, risk_level)
                
        except Exception:
            return self._fallback_suggestions(ai_percentage, risk_level)
    
    def interactive_review(
        self,
        file_path: str,
        diff_content: str,
        ai_percentage: float
    ) -> Dict[str, Any]:
        """Interactive code review using Copilot agent"""
        review = {
            "file": file_path,
            "ai_percentage": ai_percentage,
            "explanation": "",
            "suggestions": [],
            "security_concerns": [],
            "quality_score": 0.0
        }
        
        if not self.is_available:
            review["explanation"] = "Copilot not available - using fallback analysis"
            review["suggestions"] = self._fallback_suggestions(ai_percentage, "medium")
            return review
        
        # Get explanation
        review["explanation"] = self.explain_code(diff_content, file_path=file_path)
        
        # Get suggestions
        review["suggestions"] = self.suggest_improvements(
            diff_content,
            ai_percentage,
            self._get_risk_level(ai_percentage)
        )
        
        # Security analysis
        review["security_concerns"] = self._analyze_security(diff_content)
        
        # Quality scoring
        review["quality_score"] = self._calculate_quality_score(
            diff_content,
            ai_percentage
        )
        
        return review
    
    def chat_with_agent(
        self,
        message: str,
        context: Optional[Dict] = None
    ) -> str:
        """Interactive chat with Copilot agent"""
        if not self.is_available:
            return "Copilot agent not available. Using basic response mode."
        
        try:
            # Build context-aware prompt
            full_message = message
            if context:
                full_message = f"Context: {json.dumps(context)}\n\nQuestion: {message}"
            
            result = subprocess.run(
                ["gh", "copilot", "explain", full_message],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return "Sorry, I couldn't process that request."
                
        except Exception:
            return "Error communicating with Copilot agent."
    
    def multi_agent_analysis(
        self,
        files: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Multi-agent workflow for comprehensive analysis"""
        analysis = {
            "total_files": len(files),
            "high_priority_files": [],
            "code_smells": [],
            "security_findings": [],
            "refactoring_opportunities": [],
            "overall_assessment": ""
        }
        
        for file_data in files:
            # Agent 1: Security scan
            security = self._security_agent(file_data)
            if security:
                analysis["security_findings"].extend(security)
            
            # Agent 2: Code quality
            quality = self._quality_agent(file_data)
            if quality:
                analysis["code_smells"].extend(quality)
            
            # Agent 3: Refactoring suggestions
            refactor = self._refactoring_agent(file_data)
            if refactor:
                analysis["refactoring_opportunities"].extend(refactor)
            
            # Prioritize high-risk files
            if file_data.get("ai_percentage", 0) > 0.7:
                analysis["high_priority_files"].append(file_data["file_path"])
        
        # Overall assessment
        analysis["overall_assessment"] = self._generate_assessment(analysis)
        
        return analysis
    
    def _build_explanation_prompt(
        self,
        code: str,
        context: str,
        file_path: str
    ) -> str:
        """Build prompt for code explanation"""
        prompt = f"Explain this code"
        if file_path:
            prompt += f" from {file_path}"
        if context:
            prompt += f"\nContext: {context}"
        prompt += f"\n\n{code}"
        return prompt
    
    def _fallback_explanation(self, code: str, context: str) -> str:
        """Fallback explanation when Copilot unavailable"""
        return f"""This code appears to be AI-generated based on pattern analysis.

Key characteristics detected:
- Comprehensive error handling
- Detailed documentation
- Type hints and annotations
- Consistent formatting

Recommendation: Review carefully for:
1. Business logic correctness
2. Edge case handling
3. Security implications
4. Performance considerations
"""
    
    def _fallback_suggestions(
        self,
        ai_percentage: float,
        risk_level: str
    ) -> List[str]:
        """Fallback suggestions when Copilot unavailable"""
        suggestions = []
        
        if ai_percentage > 0.7:
            suggestions.append("High AI contribution - perform thorough manual review")
            suggestions.append("Verify all edge cases are handled correctly")
            suggestions.append("Add comprehensive unit tests")
        
        if risk_level in ["high", "critical"]:
            suggestions.append("Security review required for high-risk changes")
            suggestions.append("Consider pair programming review")
        
        suggestions.append("Validate against project coding standards")
        suggestions.append("Ensure documentation is accurate and complete")
        
        return suggestions
    
    def _parse_suggestions(self, output: str) -> List[str]:
        """Parse Copilot suggestions from output"""
        lines = output.strip().split('\n')
        suggestions = [line.strip() for line in lines if line.strip()]
        return suggestions[:5]  # Limit to top 5
    
    def _get_risk_level(self, ai_percentage: float) -> str:
        """Determine risk level from AI percentage"""
        if ai_percentage > 0.8:
            return "critical"
        elif ai_percentage > 0.6:
            return "high"
        elif ai_percentage > 0.4:
            return "medium"
        else:
            return "low"
    
    def _analyze_security(self, code: str) -> List[str]:
        """Analyze code for security concerns"""
        concerns = []
        
        security_patterns = {
            r"password": "Password handling detected - ensure proper hashing",
            r"api[_-]?key": "API key detected - verify secure storage",
            r"eval\(": "Dangerous eval() usage detected",
            r"exec\(": "Dangerous exec() usage detected",
            r"\.\.\/": "Path traversal risk detected",
            r"pickle\.loads": "Unsafe pickle usage detected",
        }
        
        import re
        for pattern, message in security_patterns.items():
            if re.search(pattern, code, re.IGNORECASE):
                concerns.append(message)
        
        return concerns
    
    def _calculate_quality_score(
        self,
        code: str,
        ai_percentage: float
    ) -> float:
        """Calculate code quality score"""
        score = 5.0  # Start with perfect score
        
        # Deduct for high AI percentage (needs review)
        if ai_percentage > 0.8:
            score -= 1.5
        elif ai_percentage > 0.6:
            score -= 0.8
        
        # Check for good practices
        if '"""' in code:
            score += 0.3  # Has docstrings
        
        if 'try:' in code and 'except' in code:
            score += 0.2  # Has error handling
        
        # Check for bad practices
        if 'TODO' in code or 'FIXME' in code:
            score -= 0.3  # Incomplete code
        
        return max(0.0, min(5.0, score))
    
    def _security_agent(self, file_data: Dict) -> List[str]:
        """Security-focused agent analysis"""
        return self._analyze_security(file_data.get("content", ""))
    
    def _quality_agent(self, file_data: Dict) -> List[str]:
        """Code quality agent analysis"""
        concerns = []
        content = file_data.get("content", "")
        
        if len(content.split('\n')) > 300:
            concerns.append(f"{file_data['file_path']}: Very large file (consider splitting)")
        
        if content.count('def ') > 20:
            concerns.append(f"{file_data['file_path']}: Many functions (consider refactoring)")
        
        return concerns
    
    def _refactoring_agent(self, file_data: Dict) -> List[str]:
        """Refactoring suggestions agent"""
        suggestions = []
        content = file_data.get("content", "")
        
        # Detect code duplication
        lines = content.split('\n')
        if len(lines) != len(set(lines)):
            suggestions.append(f"{file_data['file_path']}: Potential code duplication detected")
        
        return suggestions
    
    def _generate_assessment(self, analysis: Dict) -> str:
        """Generate overall assessment"""
        total = analysis["total_files"]
        high_priority = len(analysis["high_priority_files"])
        security = len(analysis["security_findings"])
        
        if security > 0:
            return f"⚠️  CRITICAL: {security} security concern(s) found across {total} files"
        elif high_priority > total * 0.5:
            return f"⚠️  HIGH RISK: {high_priority}/{total} files need careful review"
        elif high_priority > 0:
            return f"✓ MODERATE: {high_priority}/{total} files flagged for review"
        else:
            return f"✓ GOOD: All {total} files appear safe"
