"""
Repository Analyzer - Full repo analysis without requiring git changes
Uses LLM to provide intelligent insights
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import ast
from collections import defaultdict

from ..agentic.llm_provider import get_llm, LLMMessage


@dataclass
class RepoStats:
    """Repository statistics"""
    total_files: int
    total_lines: int
    languages: Dict[str, int]  # language: line count
    file_types: Dict[str, int]  # extension: count
    largest_files: List[Tuple[str, int]]  # (path, lines)
    potential_ai_files: List[str]
    code_quality_score: float
    complexity_estimate: str
    ai_analysis: Optional[str] = None


class RepositoryAnalyzer:
    """Analyzes entire repository for insights"""
    
    SUPPORTED_EXTENSIONS = {
        '.py': 'Python',
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.jsx': 'JavaScript',
        '.tsx': 'TypeScript',
        '.java': 'Java',
        '.go': 'Go',
        '.rs': 'Rust',
        '.php': 'PHP',
        '.rb': 'Ruby',
        '.c': 'C',
        '.cpp': 'C++',
        '.cs': 'C#',
        '.swift': 'Swift',
        '.kt': 'Kotlin',
    }
    
    IGNORE_DIRS = {
        'node_modules', '__pycache__', '.git', 'venv', 'env',
        'dist', 'build', '.next', '.nuxt', 'target', 'bin', 'obj',
        'vendor', 'coverage', '.pytest_cache'
    }
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
    
    def analyze(self, use_llm: bool = True) -> RepoStats:
        """Perform full repository analysis"""
        
        # Scan files
        files_data = self._scan_files()
        
        # Calculate statistics
        total_files = len(files_data)
        total_lines = sum(data['lines'] for data in files_data.values())
        
        # Language breakdown
        languages = defaultdict(int)
        for data in files_data.values():
            lang = data['language']
            if lang:
                languages[lang] += data['lines']
        
        # File types
        file_types = defaultdict(int)
        for path in files_data.keys():
            ext = Path(path).suffix
            if ext:
                file_types[ext] += 1
        
        # Largest files
        largest_files = sorted(
            [(path, data['lines']) for path, data in files_data.items()],
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Potential AI-generated files (heuristics)
        potential_ai_files = self._detect_potential_ai_files(files_data)
        
        # Complexity estimate
        complexity = self._estimate_complexity(files_data)
        
        # Code quality score
        quality_score = self._calculate_quality_score(files_data)
        
        # LLM analysis
        ai_analysis = None
        if use_llm:
            ai_analysis = self._get_llm_analysis(
                languages, total_files, total_lines, complexity
            )
        
        return RepoStats(
            total_files=total_files,
            total_lines=total_lines,
            languages=dict(languages),
            file_types=dict(file_types),
            largest_files=largest_files,
            potential_ai_files=potential_ai_files,
            code_quality_score=quality_score,
            complexity_estimate=complexity,
            ai_analysis=ai_analysis
        )
    
    def _scan_files(self) -> Dict[str, Dict]:
        """Scan all code files in repository"""
        files_data = {}
        
        for root, dirs, files in os.walk(self.repo_path):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if d not in self.IGNORE_DIRS]
            
            for file in files:
                ext = Path(file).suffix.lower()
                
                if ext in self.SUPPORTED_EXTENSIONS:
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(self.repo_path)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            lines = len(content.split('\n'))
                        
                        files_data[str(rel_path)] = {
                            'lines': lines,
                            'language': self.SUPPORTED_EXTENSIONS[ext],
                            'content': content[:5000],  # First 5000 chars for analysis
                            'extension': ext
                        }
                    except Exception:
                        continue
        
        return files_data
    
    def _detect_potential_ai_files(self, files_data: Dict) -> List[str]:
        """Detect files that might be AI-generated using heuristics"""
        potential_ai = []
        
        for path, data in files_data.items():
            content = data['content']
            score = 0
            
            # Heuristics for AI-generated code
            if data['language'] == 'Python':
                # Type hints everywhere
                if content.count(':') > data['lines'] * 0.3:
                    score += 1
                # Docstrings
                if '"""' in content or "'''" in content:
                    score += 1
            
            # Very consistent indentation
            if '\n    ' in content or '\n  ' in content:
                score += 1
            
            # Error handling
            if 'try:' in content and 'except' in content:
                score += 1
            
            # Verbose comments
            if content.count('#') > data['lines'] * 0.2:
                score += 1
            
            if score >= 3:
                potential_ai.append(path)
        
        return potential_ai[:20]  # Top 20
    
    def _estimate_complexity(self, files_data: Dict) -> str:
        """Estimate overall complexity"""
        avg_lines = sum(d['lines'] for d in files_data.values()) / max(len(files_data), 1)
        
        if avg_lines < 50:
            return "Low"
        elif avg_lines < 150:
            return "Medium"
        elif avg_lines < 300:
            return "High"
        else:
            return "Very High"
    
    def _calculate_quality_score(self, files_data: Dict) -> float:
        """Calculate code quality score (0-100)"""
        score = 50.0  # Base score
        
        # Bonus for documentation
        total_files = len(files_data)
        if total_files == 0:
            return 0.0
        
        docs_count = sum(
            1 for data in files_data.values()
            if '"""' in data['content'] or '#' in data['content']
        )
        docs_ratio = docs_count / total_files
        score += docs_ratio * 20
        
        # Bonus for reasonable file sizes
        avg_lines = sum(d['lines'] for d in files_data.values()) / total_files
        if 50 <= avg_lines <= 300:
            score += 15
        elif avg_lines < 50:
            score += 5
        
        # Penalty for very large files
        large_files = sum(1 for d in files_data.values() if d['lines'] > 500)
        if large_files > 0:
            score -= (large_files / total_files) * 20
        
        return max(0, min(100, score))
    
    def _get_llm_analysis(
        self, 
        languages: Dict[str, int],
        total_files: int,
        total_lines: int,
        complexity: str
    ) -> Optional[str]:
        """Get LLM-powered insights"""
        
        llm = get_llm()
        if not llm.is_available():
            return None
        
        # Build analysis prompt
        langs_str = ', '.join([f"{k} ({v} lines)" for k, v in sorted(
            languages.items(), key=lambda x: x[1], reverse=True
        )])
        
        prompt = f"""Analyze this codebase and provide brief insights:

**Repository Stats:**
- Total Files: {total_files}
- Total Lines: {total_lines:,}
- Languages: {langs_str}
- Complexity: {complexity}

**Provide:**
1. Architecture type (e.g., monolith, microservices, frontend/backend)
2. Code quality assessment (1-2 sentences)
3. Potential improvements (2-3 bullet points)
4. AI-generated code estimate (percentage)

Keep response under 150 words, professional tone."""
        
        try:
            response = llm.generate(prompt, max_tokens=300)
            return response.content
        except Exception:
            return None


class CodeSampleAnalyzer:
    """Analyzes specific code samples with LLM"""
    
    @staticmethod
    def analyze_snippet(code: str, language: str = "python") -> Optional[str]:
        """Analyze a code snippet using LLM"""
        
        llm = get_llm()
        if not llm.is_available():
            return None
        
        prompt = f"""Analyze this {language} code snippet and provide:
1. Quality score (0-10)
2. Potential issues
3. AI-generation likelihood (%)
4. Suggestions for improvement

**Code:**
```{language}
{code[:1000]}
```

Keep response under 100 words."""
        
        try:
            response = llm.generate(prompt, max_tokens=200)
            return response.content
        except Exception:
            return None
