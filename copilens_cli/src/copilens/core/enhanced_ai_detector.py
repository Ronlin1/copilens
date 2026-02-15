"""Enhanced AI detector with better heuristics and validation"""
import re
from typing import List, Dict, Tuple
from pydantic import BaseModel
from collections import Counter


class AIPattern(BaseModel):
    """AI code pattern detection result"""
    pattern_type: str
    confidence: float
    description: str


class AIDetectionResult(BaseModel):
    """Complete AI detection result with metadata"""
    ai_percentage: float
    confidence_level: str  # low, medium, high
    patterns: List[AIPattern]
    warnings: List[str]
    metadata: Dict


class EnhancedAIDetector:
    """Enhanced AI pattern detector with better accuracy"""
    
    # AI-specific patterns based on research
    AI_SIGNATURES = {
        "verbose_comments": {
            "patterns": [
                r"\"\"\"[\s\S]{100,}\"\"\"",  # Long docstrings
                r"#\s*[A-Z][a-z]+:.*\n",  # Formatted comments
                r"/\*\*[\s\S]{100,}\*/",  # Long block comments
            ],
            "weight": 0.6,
            "description": "Verbose documentation (AI-typical)"
        },
        "perfect_formatting": {
            "indicators": [
                r"\n\s*\n\s*\n",  # Excessive blank lines
                r"^[ ]{4}",  # Perfect 4-space indentation
                r":\s*#\s*[A-Z]",  # Inline comments after code
            ],
            "weight": 0.4,
            "description": "Perfectly formatted code"
        },
        "comprehensive_error_handling": {
            "patterns": [
                r"try:[\s\S]+?except\s+\w+\s+as\s+\w+:",
                r"if\s+.*\s+is\s+not\s+None:",
                r"raise\s+\w+Error\(",
            ],
            "weight": 0.5,
            "description": "Comprehensive error handling"
        },
        "type_hints_everywhere": {
            "patterns": [
                r"def\s+\w+\([^)]*:\s*\w+[^)]*\)\s*->",  # Return type hints
                r":\s*List\[",
                r":\s*Dict\[",
                r":\s*Optional\[",
            ],
            "weight": 0.7,
            "description": "Extensive type hints (Python)"
        },
        "helper_function_naming": {
            "patterns": [
                r"def\s+_[a-z_]+_helper\(",
                r"def\s+process_\w+\(",
                r"def\s+handle_\w+\(",
                r"def\s+validate_\w+\(",
            ],
            "weight": 0.5,
            "description": "Generic helper function names"
        },
        "overly_generic_variables": {
            "patterns": [
                r"\b(data|result|output|value|item|element|obj)\b",
            ],
            "weight": 0.3,
            "description": "Generic variable names"
        },
        "large_block_insertion": {
            "min_lines": 50,
            "weight": 0.8,
            "description": "Large continuous code block"
        },
        "consistent_style": {
            "weight": 0.6,
            "description": "Unusually consistent code style"
        }
    }
    
    def detect_ai_patterns(self, code: str, added_lines: int) -> List[AIPattern]:
        """Detect AI patterns with improved accuracy"""
        patterns = []
        
        # Large insertion (high confidence indicator)
        if added_lines >= 50:
            confidence = min(0.9, 0.6 + (added_lines / 100) * 0.3)
            patterns.append(AIPattern(
                pattern_type="large_insertion",
                confidence=confidence,
                description=f"{added_lines} lines added in one block"
            ))
        
        # Verbose comments
        verbose_count = sum(
            len(re.findall(p, code)) 
            for p in self.AI_SIGNATURES["verbose_comments"]["patterns"]
        )
        if verbose_count > 0:
            patterns.append(AIPattern(
                pattern_type="verbose_comments",
                confidence=min(0.85, 0.5 + verbose_count * 0.15),
                description=f"Contains {verbose_count} verbose comment block(s)"
            ))
        
        # Type hints
        type_hint_count = sum(
            len(re.findall(p, code))
            for p in self.AI_SIGNATURES["type_hints_everywhere"]["patterns"]
        )
        if type_hint_count > 3:
            patterns.append(AIPattern(
                pattern_type="type_hints_everywhere",
                confidence=min(0.8, 0.6 + type_hint_count * 0.05),
                description=f"Extensive type hints ({type_hint_count} found)"
            ))
        
        # Error handling
        error_handling = sum(
            len(re.findall(p, code))
            for p in self.AI_SIGNATURES["comprehensive_error_handling"]["patterns"]
        )
        if error_handling > 2:
            patterns.append(AIPattern(
                pattern_type="comprehensive_error_handling",
                confidence=0.65,
                description="Comprehensive error handling patterns"
            ))
        
        # Helper function naming
        helper_funcs = sum(
            len(re.findall(p, code))
            for p in self.AI_SIGNATURES["helper_function_naming"]["patterns"]
        )
        if helper_funcs > 1:
            patterns.append(AIPattern(
                pattern_type="helper_function_naming",
                confidence=0.55,
                description=f"{helper_funcs} generic helper function names"
            ))
        
        # Code consistency check
        if self._check_consistency(code):
            patterns.append(AIPattern(
                pattern_type="consistent_style",
                confidence=0.6,
                description="Unusually consistent formatting"
            ))
        
        return patterns
    
    def calculate_ai_percentage(
        self, 
        diff_content: str, 
        added_lines: int,
        file_path: str = ""
    ) -> AIDetectionResult:
        """Calculate AI percentage with confidence levels"""
        
        if added_lines == 0:
            return AIDetectionResult(
                ai_percentage=0.0,
                confidence_level="high",
                patterns=[],
                warnings=[],
                metadata={"added_lines": 0}
            )
        
        patterns = self.detect_ai_patterns(diff_content, added_lines)
        warnings = []
        
        if not patterns:
            # Low activity, harder to detect
            ai_percentage = 0.1
            confidence_level = "low"
            warnings.append("Few patterns detected - low confidence estimate")
        else:
            # Weighted scoring
            total_score = sum(p.confidence for p in patterns)
            pattern_count = len(patterns)
            
            # Base percentage from patterns
            ai_percentage = min(1.0, total_score / pattern_count)
            
            # Adjust for multiple indicators
            if pattern_count >= 4:
                ai_percentage = min(1.0, ai_percentage * 1.2)
            
            # Confidence level
            if pattern_count >= 3 and ai_percentage > 0.6:
                confidence_level = "high"
            elif pattern_count >= 2 or ai_percentage > 0.4:
                confidence_level = "medium"
            else:
                confidence_level = "low"
                warnings.append("Limited indicators - estimate may be inaccurate")
        
        # Small changes warning
        if added_lines < 10:
            warnings.append("Very small change - difficult to accurately assess")
            confidence_level = "low"
        
        # File type considerations
        if file_path.endswith(('.md', '.txt', '.json', '.yml', '.yaml')):
            warnings.append("Non-code file - AI detection may be inaccurate")
        
        return AIDetectionResult(
            ai_percentage=round(ai_percentage, 2),
            confidence_level=confidence_level,
            patterns=patterns,
            warnings=warnings,
            metadata={
                "added_lines": added_lines,
                "pattern_count": len(patterns),
                "file_path": file_path
            }
        )
    
    def _check_consistency(self, code: str) -> bool:
        """Check for unusually consistent code style"""
        lines = [l for l in code.split('\n') if l.strip()]
        
        if len(lines) < 5:
            return False
        
        # Check indentation consistency
        indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
        indent_consistency = len(set(indents)) / len(indents) if indents else 0
        
        # Check line length consistency
        line_lengths = [len(l) for l in lines]
        avg_length = sum(line_lengths) / len(line_lengths)
        length_variance = sum(abs(l - avg_length) for l in line_lengths) / len(line_lengths)
        
        # AI code tends to be very consistent
        return indent_consistency < 0.3 and length_variance < 20
