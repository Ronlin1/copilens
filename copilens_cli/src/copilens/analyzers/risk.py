"""Risk scoring engine"""
from typing import Dict, List
from pydantic import BaseModel


class RiskFactor(BaseModel):
    """Individual risk factor"""
    name: str
    score: float  # 0-5
    description: str
    severity: str  # low, medium, high, critical


class RiskScore(BaseModel):
    """Overall risk assessment"""
    total_score: float  # 0-5
    factors: List[RiskFactor]
    level: str  # low, medium, high, critical


class RiskAnalyzer:
    """Analyzes risk in code changes"""
    
    SECURITY_SENSITIVE_PATTERNS = [
        "password", "secret", "token", "key", "auth", "credential",
        "api_key", "private", "encrypt", "decrypt", "hash"
    ]
    
    SECURITY_SENSITIVE_FILES = [
        "auth", "security", "login", "password", "token", "config", "settings"
    ]
    
    def calculate_risk(
        self,
        ai_percentage: float,
        complexity_delta: int,
        added_lines: int,
        file_path: str,
        has_tests: bool = False
    ) -> RiskScore:
        """Calculate overall risk score"""
        factors = []
        
        # Factor 1: High AI contribution
        if ai_percentage > 0.7:
            factors.append(RiskFactor(
                name="High AI Contribution",
                score=4.0,
                description=f"{int(ai_percentage * 100)}% AI-generated code",
                severity="high"
            ))
        elif ai_percentage > 0.5:
            factors.append(RiskFactor(
                name="Moderate AI Contribution",
                score=2.5,
                description=f"{int(ai_percentage * 100)}% AI-generated code",
                severity="medium"
            ))
        
        # Factor 2: Complexity increase
        if complexity_delta > 20:
            factors.append(RiskFactor(
                name="High Complexity Increase",
                score=4.5,
                description=f"Complexity increased by {complexity_delta}",
                severity="critical"
            ))
        elif complexity_delta > 10:
            factors.append(RiskFactor(
                name="Moderate Complexity Increase",
                score=3.0,
                description=f"Complexity increased by {complexity_delta}",
                severity="high"
            ))
        
        # Factor 3: Large code insertion
        if added_lines > 200:
            factors.append(RiskFactor(
                name="Large Code Insertion",
                score=3.5,
                description=f"{added_lines} lines added",
                severity="high"
            ))
        elif added_lines > 100:
            factors.append(RiskFactor(
                name="Significant Code Addition",
                score=2.0,
                description=f"{added_lines} lines added",
                severity="medium"
            ))
        
        # Factor 4: Security-sensitive file
        if self._is_security_sensitive(file_path):
            factors.append(RiskFactor(
                name="Security-Sensitive File",
                score=4.0,
                description=f"Changes to security-related file: {file_path}",
                severity="critical"
            ))
        
        # Factor 5: Missing tests
        if not has_tests and added_lines > 50:
            factors.append(RiskFactor(
                name="Missing Test Coverage",
                score=3.0,
                description="No test coverage for significant changes",
                severity="high"
            ))
        
        # Calculate total score
        if not factors:
            total_score = 1.0
            level = "low"
        else:
            total_score = min(5.0, sum(f.score for f in factors) / len(factors))
            
            if total_score >= 4.0:
                level = "critical"
            elif total_score >= 3.0:
                level = "high"
            elif total_score >= 2.0:
                level = "medium"
            else:
                level = "low"
        
        return RiskScore(
            total_score=round(total_score, 1),
            factors=factors,
            level=level
        )
    
    def _is_security_sensitive(self, file_path: str) -> bool:
        """Check if file is security-sensitive"""
        file_lower = file_path.lower()
        return any(pattern in file_lower for pattern in self.SECURITY_SENSITIVE_FILES)
