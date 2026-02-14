"""Complexity analysis using radon"""
import ast
from typing import Dict, Optional
from radon.complexity import cc_visit
from radon.metrics import mi_visit


class ComplexityAnalyzer:
    """Analyzes code complexity"""
    
    def analyze_file(self, file_path: str, content: str) -> Dict:
        """Analyze complexity of a file"""
        try:
            # Cyclomatic complexity
            complexity_results = cc_visit(content)
            
            # Maintainability index
            mi_score = mi_visit(content, multi=True)
            
            total_complexity = sum(item.complexity for item in complexity_results)
            avg_complexity = total_complexity / len(complexity_results) if complexity_results else 0
            
            return {
                "file": file_path,
                "total_complexity": total_complexity,
                "average_complexity": round(avg_complexity, 2),
                "function_count": len(complexity_results),
                "maintainability_index": round(mi_score, 2) if isinstance(mi_score, (int, float)) else 0,
                "details": [
                    {
                        "name": item.name,
                        "complexity": item.complexity,
                        "lineno": item.lineno,
                    }
                    for item in complexity_results
                ]
            }
        except Exception as e:
            return {
                "file": file_path,
                "total_complexity": 0,
                "average_complexity": 0,
                "function_count": 0,
                "maintainability_index": 0,
                "error": str(e)
            }
    
    def calculate_complexity_delta(self, old_content: str, new_content: str) -> Dict:
        """Calculate complexity change between versions"""
        try:
            old_cc = cc_visit(old_content)
            new_cc = cc_visit(new_content)
            
            old_total = sum(item.complexity for item in old_cc)
            new_total = sum(item.complexity for item in new_cc)
            
            delta = new_total - old_total
            percent_change = ((new_total - old_total) / old_total * 100) if old_total > 0 else 0
            
            return {
                "old_complexity": old_total,
                "new_complexity": new_total,
                "delta": delta,
                "percent_change": round(percent_change, 2)
            }
        except Exception:
            return {
                "old_complexity": 0,
                "new_complexity": 0,
                "delta": 0,
                "percent_change": 0
            }
