"""AI pattern detection in code"""
import re
from typing import List, Dict
from pydantic import BaseModel


class AIPattern(BaseModel):
    """AI code pattern detection result"""
    pattern_type: str
    confidence: float
    description: str


class AIDetector:
    """Detects AI-generated code patterns"""
    
    # Common AI-generated code patterns
    AI_PATTERNS = {
        "large_insertion": {
            "min_lines": 50,
            "confidence": 0.6,
            "description": "Large code block insertion (AI-typical)"
        },
        "boilerplate": {
            "patterns": [
                r"\/\*\*[\s\S]*?\*\/",  # JavaDoc/JSDoc comments
                r"#\s*TODO:",
                r"#\s*FIXME:",
                r"if __name__ == ['\"]__main__['\"]:",
            ],
            "confidence": 0.4,
            "description": "Boilerplate code pattern"
        },
        "repetitive": {
            "threshold": 0.7,
            "confidence": 0.5,
            "description": "Highly repetitive code structure"
        },
        "complete_function": {
            "patterns": [
                r"def\s+\w+\([^)]*\)\s*->.*:\s*\"\"\"",  # Python with docstring
                r"function\s+\w+\([^)]*\)\s*{[\s\S]*?}",  # JavaScript
                r"public\s+\w+\s+\w+\([^)]*\)\s*{",  # Java/C#
            ],
            "confidence": 0.5,
            "description": "Complete function implementation"
        }
    }
    
    def detect_ai_patterns(self, code: str, added_lines: int) -> List[AIPattern]:
        """Detect AI patterns in code"""
        patterns = []
        
        # Large insertion detection
        if added_lines >= self.AI_PATTERNS["large_insertion"]["min_lines"]:
            patterns.append(AIPattern(
                pattern_type="large_insertion",
                confidence=min(0.9, 0.6 + (added_lines / 100) * 0.3),
                description=f"{added_lines} lines added - {self.AI_PATTERNS['large_insertion']['description']}"
            ))
        
        # Boilerplate detection
        boilerplate_count = 0
        for pattern in self.AI_PATTERNS["boilerplate"]["patterns"]:
            if re.search(pattern, code):
                boilerplate_count += 1
        
        if boilerplate_count > 0:
            patterns.append(AIPattern(
                pattern_type="boilerplate",
                confidence=min(0.8, 0.4 + boilerplate_count * 0.15),
                description=f"Contains {boilerplate_count} boilerplate patterns"
            ))
        
        # Complete function detection
        function_count = 0
        for pattern in self.AI_PATTERNS["complete_function"]["patterns"]:
            function_count += len(re.findall(pattern, code))
        
        if function_count > 0:
            patterns.append(AIPattern(
                pattern_type="complete_function",
                confidence=min(0.85, 0.5 + function_count * 0.1),
                description=f"{function_count} complete function(s) detected"
            ))
        
        return patterns
    
    def calculate_ai_percentage(self, diff_content: str, added_lines: int) -> float:
        """Calculate estimated AI contribution percentage"""
        if added_lines == 0:
            return 0.0
        
        patterns = self.detect_ai_patterns(diff_content, added_lines)
        
        if not patterns:
            return 0.1  # Base assumption
        
        # Weighted average of pattern confidences
        total_confidence = sum(p.confidence for p in patterns)
        avg_confidence = total_confidence / len(patterns)
        
        # Adjust based on number of patterns detected
        adjustment = min(0.3, len(patterns) * 0.1)
        
        return min(1.0, avg_confidence + adjustment)
