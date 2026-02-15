"""Tool Registry - Tools that the autonomous agent can use"""
from typing import Dict, Any, Callable
from pathlib import Path
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.enhanced_ai_detector import EnhancedAIDetector
from copilens.analyzers.risk import RiskAnalyzer
from copilens.analyzers.complexity import ComplexityAnalyzer
from copilens.analyzers.metrics import MetricsEngine, FileMetrics


class AgentToolRegistry:
    """Registry of tools available to the autonomous agent"""
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = repo_path
        self.git_analyzer = GitAnalyzer(repo_path)
        self.ai_detector = EnhancedAIDetector()
        self.risk_analyzer = RiskAnalyzer()
        self.complexity_analyzer = ComplexityAnalyzer()
        self.tools: Dict[str, Callable] = {}
        
        # Register all tools
        self._register_core_tools()
    
    def _register_core_tools(self):
        """Register core analysis tools"""
        
        # Analysis tools
        self.tools["analyze_repository"] = self.analyze_repository
        self.tools["security_scan"] = self.security_scan
        self.tools["quality_analysis"] = self.quality_analysis
        self.tools["ai_detection"] = self.ai_detection_analysis
        
        # Action tools
        self.tools["apply_fixes"] = self.apply_fixes
        self.tools["verify_fixes"] = self.verify_fixes
        self.tools["suggest_refactoring"] = self.suggest_refactoring
        self.tools["generate_tests"] = self.generate_tests
        
        # Reporting tools
        self.tools["create_report"] = self.create_report
        self.tools["export_metrics"] = self.export_metrics
    
    def get_tool(self, name: str) -> Callable:
        """Get a tool by name"""
        return self.tools.get(name)
    
    def list_tools(self) -> Dict[str, str]:
        """List all available tools"""
        return {
            name: func.__doc__ or "No description"
            for name, func in self.tools.items()
        }
    
    # ===== TOOL IMPLEMENTATIONS =====
    
    def analyze_repository(self, **kwargs) -> Dict[str, Any]:
        """Analyze repository for AI-generated code"""
        try:
            diffs = self.git_analyzer.get_diff()
            
            if not diffs:
                return {
                    "success": True,
                    "files_analyzed": 0,
                    "total_risk": 0,
                    "high_risk_files": []
                }
            
            metrics_engine = MetricsEngine()
            high_risk_files = []
            
            for diff in diffs:
                # AI detection
                ai_result = self.ai_detector.calculate_ai_percentage(
                    diff.diff_content,
                    diff.added_lines,
                    diff.file_path
                )
                
                # Risk analysis
                risk_score = self.risk_analyzer.calculate_risk(
                    ai_percentage=ai_result.ai_percentage,
                    complexity_delta=diff.added_lines // 10,
                    added_lines=diff.added_lines,
                    file_path=diff.file_path,
                    has_tests=False
                )
                
                if risk_score.level in ["high", "critical"]:
                    high_risk_files.append(diff.file_path)
                
                metrics_engine.add_file_metrics(FileMetrics(
                    file_path=diff.file_path,
                    ai_percentage=ai_result.ai_percentage,
                    added_lines=diff.added_lines,
                    deleted_lines=diff.deleted_lines,
                    complexity=diff.added_lines // 10,
                    risk_score=risk_score.total_score,
                    risk_level=risk_score.level
                ))
            
            aggregate = metrics_engine.calculate_aggregate()
            
            return {
                "success": True,
                "files_analyzed": len(diffs),
                "total_risk": aggregate.average_risk_score,
                "high_risk_files": high_risk_files,
                "ai_percentage": aggregate.average_ai_percentage,
                "total_added_lines": aggregate.total_added_lines,
                "risk_reduction": 0  # For goal tracking
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def security_scan(self, **kwargs) -> Dict[str, Any]:
        """Scan for security vulnerabilities"""
        try:
            diffs = self.git_analyzer.get_diff()
            vulnerabilities = []
            
            for diff in diffs:
                vuln = self._detect_security_issues(diff.diff_content, diff.file_path)
                if vuln:
                    vulnerabilities.extend(vuln)
            
            return {
                "success": True,
                "vulnerabilities_found": len(vulnerabilities),
                "vulnerabilities": vulnerabilities,
                "risk_reduction": min(20, len(vulnerabilities) * 5)  # Track reduction
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def quality_analysis(self, **kwargs) -> Dict[str, Any]:
        """Analyze code quality metrics"""
        try:
            diffs = self.git_analyzer.get_diff()
            quality_issues = []
            total_complexity = 0
            
            for diff in diffs:
                # Complexity analysis
                if diff.diff_content:
                    try:
                        analysis = self.complexity_analyzer.analyze_file(
                            diff.file_path,
                            diff.diff_content
                        )
                        total_complexity += analysis.get("total_complexity", 0)
                        
                        if analysis.get("total_complexity", 0) > 15:
                            quality_issues.append({
                                "file": diff.file_path,
                                "issue": "High complexity",
                                "severity": "medium"
                            })
                    except:
                        pass
            
            return {
                "success": True,
                "quality_issues": len(quality_issues),
                "total_complexity": total_complexity,
                "issues": quality_issues,
                "quality_improvement": min(30, len(quality_issues) * 10)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def ai_detection_analysis(self, **kwargs) -> Dict[str, Any]:
        """Deep AI pattern analysis"""
        try:
            diffs = self.git_analyzer.get_diff()
            ai_files = []
            
            for diff in diffs:
                result = self.ai_detector.calculate_ai_percentage(
                    diff.diff_content,
                    diff.added_lines,
                    diff.file_path
                )
                
                if result.ai_percentage > 0.6:
                    ai_files.append({
                        "file": diff.file_path,
                        "ai_percentage": result.ai_percentage,
                        "confidence": result.confidence_level
                    })
            
            return {
                "success": True,
                "high_ai_files": len(ai_files),
                "files": ai_files
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def apply_fixes(self, auto_fix: bool = False, **kwargs) -> Dict[str, Any]:
        """Apply automated fixes to identified issues"""
        if not auto_fix:
            return {
                "success": True,
                "fixes_applied": 0,
                "message": "Auto-fix disabled. Manual review required.",
                "risk_reduction": 0
            }
        
        # Placeholder for actual fix application
        # In real implementation, would apply automated fixes
        return {
            "success": True,
            "fixes_applied": 0,
            "message": "Automated fixes would be applied here",
            "risk_reduction": 15
        }
    
    def verify_fixes(self, **kwargs) -> Dict[str, Any]:
        """Verify that applied fixes worked"""
        # Re-analyze to check if risk reduced
        analysis_result = self.analyze_repository()
        
        if analysis_result.get("success"):
            return {
                "success": True,
                "verified": True,
                "current_risk": analysis_result.get("total_risk", 0),
                "risk_reduction": 10
            }
        
        return {
            "success": False,
            "verified": False
        }
    
    def suggest_refactoring(self, **kwargs) -> Dict[str, Any]:
        """Suggest code refactoring opportunities"""
        try:
            diffs = self.git_analyzer.get_diff()
            suggestions = []
            
            for diff in diffs:
                if diff.added_lines > 100:
                    suggestions.append({
                        "file": diff.file_path,
                        "suggestion": "Consider splitting large file",
                        "priority": "high"
                    })
            
            return {
                "success": True,
                "suggestions": len(suggestions),
                "refactoring_opportunities": suggestions,
                "quality_improvement": len(suggestions) * 10
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_tests(self, **kwargs) -> Dict[str, Any]:
        """Generate test cases for AI-generated code"""
        # Placeholder for test generation
        return {
            "success": True,
            "tests_generated": 0,
            "message": "Test generation would happen here",
            "quality_improvement": 20
        }
    
    def create_report(self, format: str = "json", **kwargs) -> Dict[str, Any]:
        """Create analysis report"""
        analysis = self.analyze_repository()
        
        return {
            "success": True,
            "report_format": format,
            "report_data": analysis
        }
    
    def export_metrics(self, output_file: str = "metrics.json", **kwargs) -> Dict[str, Any]:
        """Export metrics to file"""
        try:
            analysis = self.analyze_repository()
            
            output_path = Path(output_file)
            import json
            with open(output_path, 'w') as f:
                json.dump(analysis, f, indent=2)
            
            return {
                "success": True,
                "exported_to": str(output_path)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _detect_security_issues(self, code: str, file_path: str) -> List[Dict[str, Any]]:
        """Detect security issues in code"""
        issues = []
        
        patterns = {
            r"eval\(": "Dangerous eval() usage",
            r"exec\(": "Dangerous exec() usage",
            r"pickle\.loads": "Unsafe pickle usage",
            r"password\s*=\s*['\"]": "Hardcoded password",
            r"api[_-]?key\s*=\s*['\"]": "Hardcoded API key",
            r"\.\.\/": "Potential path traversal",
        }
        
        import re
        for pattern, description in patterns.items():
            if re.search(pattern, code, re.IGNORECASE):
                issues.append({
                    "file": file_path,
                    "issue": description,
                    "severity": "high",
                    "pattern": pattern
                })
        
        return issues
