"""Git repository interactions"""
import os
from pathlib import Path
from typing import Optional, List
from git import Repo, GitCommandError
from pydantic import BaseModel


class GitDiff(BaseModel):
    """Represents a Git diff"""
    file_path: str
    added_lines: int
    deleted_lines: int
    diff_content: str


class GitAnalyzer:
    """Analyzes Git repository"""
    
    def __init__(self, repo_path: Optional[str] = None):
        self.repo_path = repo_path or os.getcwd()
        try:
            self.repo = Repo(self.repo_path, search_parent_directories=True)
        except Exception:
            self.repo = None
    
    def is_git_repo(self) -> bool:
        """Check if current directory is a Git repository"""
        return self.repo is not None
    
    def get_diff(self, commit: str = "HEAD", staged: bool = False) -> List[GitDiff]:
        """Get diff for a specific commit or staged changes"""
        if not self.repo:
            return []
        
        try:
            if staged:
                diff_index = self.repo.index.diff("HEAD")
            else:
                diff_index = self.repo.head.commit.diff(None)
            
            diffs = []
            for diff_item in diff_index:
                added = 0
                deleted = 0
                
                if diff_item.diff:
                    for line in diff_item.diff.decode('utf-8', errors='ignore').split('\n'):
                        if line.startswith('+') and not line.startswith('+++'):
                            added += 1
                        elif line.startswith('-') and not line.startswith('---'):
                            deleted += 1
                
                diffs.append(GitDiff(
                    file_path=diff_item.a_path or diff_item.b_path,
                    added_lines=added,
                    deleted_lines=deleted,
                    diff_content=diff_item.diff.decode('utf-8', errors='ignore') if diff_item.diff else ""
                ))
            
            return diffs
        except Exception as e:
            return []
    
    def get_recent_commits(self, count: int = 10) -> List[str]:
        """Get recent commit SHAs"""
        if not self.repo:
            return []
        
        try:
            commits = list(self.repo.iter_commits(max_count=count))
            return [commit.hexsha[:7] for commit in commits]
        except Exception:
            return []
