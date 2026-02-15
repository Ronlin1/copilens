"""
Remote Repository Analyzer
Analyzes public GitHub/GitLab repositories or source code URLs
"""

import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
import subprocess

from ..analyzers.repo_analyzer import RepositoryAnalyzer
from ..analyzers.architecture_detector import ArchitectureDetector


class RemoteRepoAnalyzer:
    """Analyze remote repositories from URLs"""
    
    def __init__(self, url: str):
        self.url = url
        self.temp_dir: Optional[Path] = None
        self.repo_path: Optional[Path] = None
        self.is_cloned = False
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cleanup"""
        self.cleanup()
    
    def cleanup(self):
        """Clean up temporary directory"""
        if self.temp_dir and self.temp_dir.exists():
            try:
                shutil.rmtree(self.temp_dir)
            except Exception:
                pass
    
    def is_git_url(self) -> bool:
        """Check if URL is a Git repository"""
        git_patterns = [
            'github.com',
            'gitlab.com',
            'bitbucket.org',
            '.git',
        ]
        return any(pattern in self.url.lower() for pattern in git_patterns)
    
    def normalize_url(self) -> str:
        """Normalize Git URL for cloning"""
        url = self.url.strip()
        
        # GitHub URL variations
        if 'github.com' in url:
            # Convert web URL to git URL
            if not url.endswith('.git') and 'git@' not in url:
                # Handle various GitHub URL formats
                url = url.replace('https://github.com/', '')
                url = url.replace('http://github.com/', '')
                url = url.rstrip('/')
                return f'https://github.com/{url}.git'
        
        # GitLab URL variations
        elif 'gitlab.com' in url:
            if not url.endswith('.git') and 'git@' not in url:
                url = url.replace('https://gitlab.com/', '')
                url = url.replace('http://gitlab.com/', '')
                url = url.rstrip('/')
                return f'https://gitlab.com/{url}.git'
        
        return url
    
    def clone_repository(self, depth: int = 1) -> Path:
        """
        Clone repository to temporary directory
        
        Args:
            depth: Clone depth (1 for shallow clone)
        
        Returns:
            Path to cloned repository
        """
        if self.is_cloned:
            return self.repo_path
        
        # Create temp directory
        self.temp_dir = Path(tempfile.mkdtemp(prefix='copilens_remote_'))
        self.repo_path = self.temp_dir / 'repo'
        
        # Normalize URL
        clone_url = self.normalize_url()
        
        # Clone command
        cmd = ['git', 'clone']
        if depth > 0:
            cmd.extend(['--depth', str(depth)])
        cmd.extend([clone_url, str(self.repo_path)])
        
        try:
            # Run git clone
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Git clone failed: {result.stderr}")
            
            self.is_cloned = True
            return self.repo_path
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Clone timeout (5 minutes). Repository too large?")
        except FileNotFoundError:
            raise RuntimeError("Git not found. Please install Git: https://git-scm.com/downloads")
        except Exception as e:
            raise RuntimeError(f"Clone failed: {e}")
    
    def get_repository_info(self) -> Dict[str, Any]:
        """Extract repository information from URL"""
        info = {
            'url': self.url,
            'platform': 'unknown',
            'owner': None,
            'repo_name': None,
            'is_git': self.is_git_url()
        }
        
        # Parse GitHub URLs
        if 'github.com' in self.url:
            info['platform'] = 'github'
            parts = self.url.replace('https://', '').replace('http://', '').split('/')
            if len(parts) >= 3:
                info['owner'] = parts[1]
                info['repo_name'] = parts[2].replace('.git', '')
        
        # Parse GitLab URLs
        elif 'gitlab.com' in self.url:
            info['platform'] = 'gitlab'
            parts = self.url.replace('https://', '').replace('http://', '').split('/')
            if len(parts) >= 3:
                info['owner'] = parts[1]
                info['repo_name'] = parts[2].replace('.git', '')
        
        # Parse Bitbucket URLs
        elif 'bitbucket.org' in self.url:
            info['platform'] = 'bitbucket'
            parts = self.url.replace('https://', '').replace('http://', '').split('/')
            if len(parts) >= 3:
                info['owner'] = parts[1]
                info['repo_name'] = parts[2].replace('.git', '')
        
        return info
    
    def analyze(self, use_llm: bool = True) -> Dict[str, Any]:
        """
        Analyze remote repository
        
        Args:
            use_llm: Use LLM for analysis
        
        Returns:
            Analysis results
        """
        # Clone repository
        repo_path = self.clone_repository()
        
        # Get repository info
        repo_info = self.get_repository_info()
        
        # Detect architecture
        arch_detector = ArchitectureDetector(str(repo_path))
        architecture = arch_detector.detect()
        
        # Analyze repository
        analyzer = RepositoryAnalyzer(str(repo_path))
        analysis = analyzer.analyze()
        
        # Get file tree summary
        files = analyzer._scan_files()
        
        # Combine results
        return {
            'repository': repo_info,
            'architecture': {
                'type': architecture.project_type.value,
                'languages': architecture.languages,
                'frameworks': architecture.frameworks,
                'has_frontend': architecture.has_frontend,
                'has_backend': architecture.has_backend,
                'has_database': architecture.has_database,
            },
            'analysis': {
                'total_files': analysis['file_count'],
                'total_lines': analysis['total_lines'],
                'languages': analysis.get('languages', {}),
                'avg_file_size': analysis['avg_file_size'],
                'large_files': analysis['large_files'],
                'quality_score': analysis['quality_score'],
                'ai_probability': analysis.get('ai_probability', 0),
            },
            'files': files[:50],  # First 50 files for context
            'local_path': str(repo_path),
        }
    
    def get_code_summary(self, max_files: int = 20) -> str:
        """
        Get code summary for LLM analysis
        
        Args:
            max_files: Maximum files to include
        
        Returns:
            Code summary string
        """
        if not self.is_cloned:
            self.clone_repository()
        
        analyzer = RepositoryAnalyzer(str(self.repo_path))
        files = analyzer._scan_files()
        
        # Build summary
        summary = []
        summary.append(f"Repository: {self.url}")
        summary.append(f"Total Files: {len(files)}")
        summary.append("\n## File Structure\n")
        
        # Add file tree
        for i, file in enumerate(files[:max_files]):
            summary.append(f"- {file['path']} ({file['lines']} lines, {file['language']})")
        
        if len(files) > max_files:
            summary.append(f"... and {len(files) - max_files} more files")
        
        # Add sample files (key configuration and entry points)
        summary.append("\n## Key Files Content\n")
        
        key_files = [
            'README.md', 'readme.md',
            'package.json', 'requirements.txt', 'go.mod', 'Cargo.toml',
            'main.py', 'app.py', 'index.js', 'main.go', 'main.rs',
            'Dockerfile', 'docker-compose.yml',
        ]
        
        for file in files:
            if any(kf in file['path'] for kf in key_files):
                try:
                    file_path = self.repo_path / file['path']
                    if file_path.exists() and file_path.stat().st_size < 50000:  # < 50KB
                        content = file_path.read_text(encoding='utf-8', errors='ignore')
                        summary.append(f"\n### {file['path']}\n```{file['language']}\n{content}\n```\n")
                except Exception:
                    pass
        
        return '\n'.join(summary)
