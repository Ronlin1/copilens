"""
File System Tools for AI Chat
Enables chat to interact with local files and directories
"""

import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import fnmatch
from rich.console import Console
from rich.tree import Tree
from rich.syntax import Syntax

console = Console()


class FileSystemTools:
    """Tools for file system operations in AI chat"""
    
    def __init__(self, root_dir: Optional[Path] = None):
        self.root_dir = Path(root_dir) if root_dir else Path.cwd()
        self.max_file_size = 1_000_000  # 1MB max for display
    
    def read_file(self, file_path: str) -> Tuple[bool, str]:
        """
        Read file contents
        
        Returns:
            (success: bool, content_or_error: str)
        """
        try:
            full_path = self._resolve_path(file_path)
            
            if not full_path.exists():
                return False, f"File not found: {file_path}"
            
            if not full_path.is_file():
                return False, f"Not a file: {file_path}"
            
            # Check file size
            size = full_path.stat().st_size
            if size > self.max_file_size:
                return False, f"File too large ({size} bytes). Max: {self.max_file_size}"
            
            # Read file
            content = full_path.read_text(encoding='utf-8', errors='ignore')
            return True, content
            
        except Exception as e:
            return False, f"Error reading file: {e}"
    
    def write_file(self, file_path: str, content: str, create: bool = True) -> Tuple[bool, str]:
        """
        Write content to file
        
        Args:
            file_path: Path to file
            content: Content to write
            create: Create file if doesn't exist
        
        Returns:
            (success: bool, message: str)
        """
        try:
            full_path = self._resolve_path(file_path)
            
            # Check if file exists
            if not full_path.exists() and not create:
                return False, f"File not found: {file_path}"
            
            # Create parent directories
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            full_path.write_text(content, encoding='utf-8')
            
            action = "created" if not full_path.exists() else "updated"
            return True, f"File {action}: {file_path}"
            
        except Exception as e:
            return False, f"Error writing file: {e}"
    
    def list_files(
        self,
        directory: str = ".",
        pattern: str = "*",
        recursive: bool = False,
        show_hidden: bool = False
    ) -> Tuple[bool, List[Dict[str, str]]]:
        """
        List files in directory
        
        Returns:
            (success: bool, files_or_error: List[Dict] or str)
        """
        try:
            full_path = self._resolve_path(directory)
            
            if not full_path.exists():
                return False, f"Directory not found: {directory}"
            
            if not full_path.is_dir():
                return False, f"Not a directory: {directory}"
            
            files = []
            
            if recursive:
                for item in full_path.rglob(pattern):
                    if not show_hidden and any(p.startswith('.') for p in item.parts):
                        continue
                    files.append(self._file_info(item))
            else:
                for item in full_path.glob(pattern):
                    if not show_hidden and item.name.startswith('.'):
                        continue
                    files.append(self._file_info(item))
            
            return True, files
            
        except Exception as e:
            return False, f"Error listing files: {e}"
    
    def create_tree(self, directory: str = ".", max_depth: int = 3) -> Tuple[bool, str]:
        """
        Create directory tree visualization
        
        Returns:
            (success: bool, tree_string_or_error: str)
        """
        try:
            full_path = self._resolve_path(directory)
            
            if not full_path.exists():
                return False, f"Directory not found: {directory}"
            
            tree = Tree(f"📁 {full_path.name}")
            self._build_tree(full_path, tree, max_depth, 0)
            
            # Render to string
            from io import StringIO
            from rich.console import Console
            
            string_io = StringIO()
            console = Console(file=string_io, force_terminal=False, width=100)
            console.print(tree)
            tree_str = string_io.getvalue()
            
            return True, tree_str
            
        except Exception as e:
            return False, f"Error creating tree: {e}"
    
    def search_files(
        self,
        pattern: str,
        directory: str = ".",
        content_search: bool = False
    ) -> Tuple[bool, List[str]]:
        """
        Search for files by name or content
        
        Args:
            pattern: Search pattern (file name or content)
            directory: Directory to search in
            content_search: Search file contents instead of names
        
        Returns:
            (success: bool, matches_or_error: List[str] or str)
        """
        try:
            full_path = self._resolve_path(directory)
            matches = []
            
            if not full_path.exists():
                return False, f"Directory not found: {directory}"
            
            if content_search:
                # Search file contents
                for item in full_path.rglob('*'):
                    if item.is_file():
                        try:
                            content = item.read_text(encoding='utf-8', errors='ignore')
                            if pattern.lower() in content.lower():
                                matches.append(str(item.relative_to(self.root_dir)))
                        except:
                            continue
            else:
                # Search file names
                for item in full_path.rglob('*'):
                    if fnmatch.fnmatch(item.name.lower(), pattern.lower()):
                        matches.append(str(item.relative_to(self.root_dir)))
            
            return True, matches
            
        except Exception as e:
            return False, f"Error searching: {e}"
    
    def get_file_stats(self, file_path: str) -> Tuple[bool, Dict[str, str]]:
        """Get file statistics"""
        try:
            full_path = self._resolve_path(file_path)
            
            if not full_path.exists():
                return False, {"error": f"File not found: {file_path}"}
            
            stats = full_path.stat()
            
            info = {
                "path": str(full_path),
                "size": self._format_size(stats.st_size),
                "type": "directory" if full_path.is_dir() else "file",
                "modified": str(stats.st_mtime),
            }
            
            if full_path.is_file():
                info["lines"] = len(full_path.read_text(errors='ignore').splitlines())
            
            return True, info
            
        except Exception as e:
            return False, {"error": f"Error getting stats: {e}"}
    
    def analyze_directory(self, directory: str = ".") -> Tuple[bool, Dict[str, any]]:
        """
        Analyze directory structure and contents
        
        Returns:
            (success: bool, analysis_or_error: Dict)
        """
        try:
            full_path = self._resolve_path(directory)
            
            if not full_path.exists():
                return False, {"error": f"Directory not found: {directory}"}
            
            # Collect stats
            total_files = 0
            total_dirs = 0
            total_size = 0
            file_types = {}
            largest_files = []
            
            for item in full_path.rglob('*'):
                if item.is_file():
                    total_files += 1
                    size = item.stat().st_size
                    total_size += size
                    
                    # Track file types
                    ext = item.suffix or 'no extension'
                    file_types[ext] = file_types.get(ext, 0) + 1
                    
                    # Track largest files
                    largest_files.append((str(item.relative_to(full_path)), size))
                elif item.is_dir():
                    total_dirs += 1
            
            # Sort largest files
            largest_files.sort(key=lambda x: x[1], reverse=True)
            largest_files = largest_files[:10]
            
            analysis = {
                "total_files": total_files,
                "total_directories": total_dirs,
                "total_size": self._format_size(total_size),
                "file_types": file_types,
                "largest_files": [
                    {"path": path, "size": self._format_size(size)}
                    for path, size in largest_files
                ],
                "most_common_types": sorted(
                    file_types.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:10]
            }
            
            return True, analysis
            
        except Exception as e:
            return False, {"error": f"Error analyzing directory: {e}"}
    
    def _resolve_path(self, path: str) -> Path:
        """Resolve path relative to root directory"""
        path_obj = Path(path)
        if path_obj.is_absolute():
            return path_obj
        return (self.root_dir / path).resolve()
    
    def _file_info(self, path: Path) -> Dict[str, str]:
        """Get file information as dict"""
        stats = path.stat()
        return {
            "name": path.name,
            "path": str(path.relative_to(self.root_dir)),
            "type": "directory" if path.is_dir() else "file",
            "size": self._format_size(stats.st_size),
        }
    
    def _format_size(self, size: int) -> str:
        """Format file size"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    def _build_tree(self, directory: Path, tree: Tree, max_depth: int, current_depth: int):
        """Recursively build directory tree"""
        if current_depth >= max_depth:
            return
        
        try:
            items = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name))
            
            for item in items:
                if item.name.startswith('.'):
                    continue
                
                if item.is_dir():
                    branch = tree.add(f"📁 {item.name}")
                    self._build_tree(item, branch, max_depth, current_depth + 1)
                else:
                    icon = self._get_file_icon(item.suffix)
                    tree.add(f"{icon} {item.name}")
        except PermissionError:
            tree.add("[dim]Permission denied[/dim]")
    
    def _get_file_icon(self, suffix: str) -> str:
        """Get emoji icon for file type"""
        icons = {
            '.py': '🐍',
            '.js': '📜',
            '.ts': '📘',
            '.java': '☕',
            '.cpp': '⚙️',
            '.c': '⚙️',
            '.go': '🔷',
            '.rs': '🦀',
            '.html': '🌐',
            '.css': '🎨',
            '.json': '📋',
            '.xml': '📋',
            '.md': '📝',
            '.txt': '📄',
            '.pdf': '📕',
            '.png': '🖼️',
            '.jpg': '🖼️',
            '.svg': '🎨',
        }
        return icons.get(suffix.lower(), '📄')
