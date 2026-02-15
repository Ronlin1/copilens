"""
Configuration File Detector for Copilens
Auto-detects and analyzes all configuration files in a project
"""

import os
import json
import yaml
import toml
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class ConfigType(Enum):
    """Configuration file types"""
    PACKAGE_MANAGER = "package_manager"
    BUILD_TOOL = "build_tool"
    ENVIRONMENT = "environment"
    DOCKER = "docker"
    CI_CD = "ci_cd"
    DEPLOYMENT = "deployment"
    LINTER = "linter"
    TESTING = "testing"
    DATABASE = "database"
    WEBSERVER = "webserver"
    OTHER = "other"


@dataclass
class ConfigFile:
    """Represents a detected configuration file"""
    path: str
    type: ConfigType
    format: str  # json, yaml, toml, env, etc.
    exists: bool
    content: Optional[Dict[str, Any]] = None
    issues: List[str] = None
    recommendations: List[str] = None
    
    def __post_init__(self):
        if self.issues is None:
            self.issues = []
        if self.recommendations is None:
            self.recommendations = []


class ConfigDetector:
    """Detects and analyzes configuration files"""
    
    # Config file patterns
    CONFIG_PATTERNS = {
        # Package managers
        'package.json': ConfigType.PACKAGE_MANAGER,
        'requirements.txt': ConfigType.PACKAGE_MANAGER,
        'Pipfile': ConfigType.PACKAGE_MANAGER,
        'pyproject.toml': ConfigType.PACKAGE_MANAGER,
        'Gemfile': ConfigType.PACKAGE_MANAGER,
        'go.mod': ConfigType.PACKAGE_MANAGER,
        'Cargo.toml': ConfigType.PACKAGE_MANAGER,
        'composer.json': ConfigType.PACKAGE_MANAGER,
        
        # Build tools
        'vite.config.js': ConfigType.BUILD_TOOL,
        'vite.config.ts': ConfigType.BUILD_TOOL,
        'webpack.config.js': ConfigType.BUILD_TOOL,
        'rollup.config.js': ConfigType.BUILD_TOOL,
        'tsconfig.json': ConfigType.BUILD_TOOL,
        'babel.config.js': ConfigType.BUILD_TOOL,
        'esbuild.config.js': ConfigType.BUILD_TOOL,
        
        # Environment
        '.env': ConfigType.ENVIRONMENT,
        '.env.local': ConfigType.ENVIRONMENT,
        '.env.production': ConfigType.ENVIRONMENT,
        '.env.development': ConfigType.ENVIRONMENT,
        '.env.example': ConfigType.ENVIRONMENT,
        
        # Docker
        'Dockerfile': ConfigType.DOCKER,
        'docker-compose.yml': ConfigType.DOCKER,
        'docker-compose.yaml': ConfigType.DOCKER,
        '.dockerignore': ConfigType.DOCKER,
        
        # CI/CD
        '.github/workflows': ConfigType.CI_CD,
        '.gitlab-ci.yml': ConfigType.CI_CD,
        'azure-pipelines.yml': ConfigType.CI_CD,
        'Jenkinsfile': ConfigType.CI_CD,
        '.circleci/config.yml': ConfigType.CI_CD,
        
        # Deployment
        'vercel.json': ConfigType.DEPLOYMENT,
        'netlify.toml': ConfigType.DEPLOYMENT,
        'railway.json': ConfigType.DEPLOYMENT,
        'render.yaml': ConfigType.DEPLOYMENT,
        'app.json': ConfigType.DEPLOYMENT,
        'Procfile': ConfigType.DEPLOYMENT,
        'fly.toml': ConfigType.DEPLOYMENT,
        
        # Linters
        '.eslintrc.js': ConfigType.LINTER,
        '.eslintrc.json': ConfigType.LINTER,
        '.prettierrc': ConfigType.LINTER,
        '.pylintrc': ConfigType.LINTER,
        'pyproject.toml': ConfigType.LINTER,
        '.rubocop.yml': ConfigType.LINTER,
        
        # Testing
        'jest.config.js': ConfigType.TESTING,
        'vitest.config.ts': ConfigType.TESTING,
        'pytest.ini': ConfigType.TESTING,
        'phpunit.xml': ConfigType.TESTING,
        
        # Database
        'prisma/schema.prisma': ConfigType.DATABASE,
        'knexfile.js': ConfigType.DATABASE,
        'database.yml': ConfigType.DATABASE,
        
        # Web servers
        'nginx.conf': ConfigType.WEBSERVER,
        'apache.conf': ConfigType.WEBSERVER,
    }
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
    
    def detect_all(self) -> List[ConfigFile]:
        """Detect all configuration files"""
        configs = []
        
        for pattern, config_type in self.CONFIG_PATTERNS.items():
            # Handle directory patterns
            if '/' in pattern:
                path = self.project_path / pattern
                if path.is_dir() or path.is_file():
                    configs.append(self._analyze_config(pattern, config_type))
            else:
                # Check if file exists
                file_path = self.project_path / pattern
                if file_path.exists():
                    configs.append(self._analyze_config(pattern, config_type))
        
        return configs
    
    def _analyze_config(self, path: str, config_type: ConfigType) -> ConfigFile:
        """Analyze a specific config file"""
        full_path = self.project_path / path
        exists = full_path.exists()
        
        if not exists:
            return ConfigFile(
                path=path,
                type=config_type,
                format="unknown",
                exists=False
            )
        
        # Determine format
        format_type = self._detect_format(path)
        
        # Read content
        content = self._read_config(full_path, format_type)
        
        # Analyze for issues
        issues, recommendations = self._analyze_for_issues(
            path, config_type, content
        )
        
        return ConfigFile(
            path=path,
            type=config_type,
            format=format_type,
            exists=True,
            content=content,
            issues=issues,
            recommendations=recommendations
        )
    
    def _detect_format(self, path: str) -> str:
        """Detect config file format"""
        path_lower = path.lower()
        
        if path_lower.endswith('.json'):
            return 'json'
        elif path_lower.endswith(('.yml', '.yaml')):
            return 'yaml'
        elif path_lower.endswith('.toml'):
            return 'toml'
        elif path_lower.endswith('.env') or '.env.' in path_lower:
            return 'env'
        elif path_lower.endswith(('.js', '.ts', '.mjs')):
            return 'javascript'
        elif 'Dockerfile' in path:
            return 'dockerfile'
        elif 'Procfile' in path:
            return 'procfile'
        
        return 'text'
    
    def _read_config(self, path: Path, format_type: str) -> Optional[Dict[str, Any]]:
        """Read configuration file"""
        try:
            if format_type == 'json':
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            elif format_type == 'yaml':
                with open(path, 'r', encoding='utf-8') as f:
                    return yaml.safe_load(f)
            
            elif format_type == 'toml':
                with open(path, 'r', encoding='utf-8') as f:
                    return toml.load(f)
            
            elif format_type == 'env':
                env_vars = {}
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            if '=' in line:
                                key, value = line.split('=', 1)
                                env_vars[key.strip()] = value.strip()
                return env_vars
            
            else:
                # Read as text
                with open(path, 'r', encoding='utf-8') as f:
                    return {'content': f.read()}
        
        except Exception:
            return None
    
    def _analyze_for_issues(
        self, 
        path: str, 
        config_type: ConfigType,
        content: Optional[Dict[str, Any]]
    ) -> tuple[List[str], List[str]]:
        """Analyze config for issues and recommendations"""
        issues = []
        recommendations = []
        
        if not content:
            return issues, recommendations
        
        # Package.json analysis
        if path == 'package.json':
            if 'scripts' not in content:
                issues.append("No scripts defined")
            if 'start' not in content.get('scripts', {}):
                recommendations.append("Add 'start' script for deployment")
            if 'build' not in content.get('scripts', {}):
                recommendations.append("Add 'build' script")
            if not content.get('version'):
                issues.append("Missing version field")
        
        # Dockerfile analysis
        elif path == 'Dockerfile':
            dockerfile_content = content.get('content', '')
            if 'EXPOSE' not in dockerfile_content:
                recommendations.append("Add EXPOSE directive for port")
            if 'CMD' not in dockerfile_content and 'ENTRYPOINT' not in dockerfile_content:
                issues.append("Missing CMD or ENTRYPOINT")
            if 'FROM node:latest' in dockerfile_content or 'FROM python:latest' in dockerfile_content:
                issues.append("Using :latest tag is not recommended")
        
        # .env analysis
        elif '.env' in path and path != '.env.example':
            if content:
                recommendations.append("Ensure this file is in .gitignore")
        
        # Requirements.txt analysis
        elif path == 'requirements.txt':
            req_content = content.get('content', '')
            if not any('==' in line for line in req_content.split('\n')):
                recommendations.append("Pin dependency versions with ==")
        
        return issues, recommendations
    
    def generate_missing_configs(self, project_type: str) -> Dict[str, str]:
        """Generate content for missing configuration files"""
        templates = {}
        
        # Generate .dockerignore
        if not (self.project_path / '.dockerignore').exists():
            templates['.dockerignore'] = self._generate_dockerignore(project_type)
        
        # Generate .env.example
        if (self.project_path / '.env').exists() and \
           not (self.project_path / '.env.example').exists():
            templates['.env.example'] = self._generate_env_example()
        
        # Generate README.md
        if not any((self.project_path / f).exists() for f in ['README.md', 'README.rst']):
            templates['README.md'] = self._generate_readme(project_type)
        
        return templates
    
    def _generate_dockerignore(self, project_type: str) -> str:
        """Generate .dockerignore content"""
        common = [
            "node_modules",
            "__pycache__",
            "*.pyc",
            ".git",
            ".gitignore",
            "README.md",
            ".env",
            ".env.local",
            "npm-debug.log",
            "yarn-error.log",
            ".DS_Store",
            "dist",
            "build",
            "coverage",
            ".vscode",
            ".idea"
        ]
        
        return '\n'.join(common)
    
    def _generate_env_example(self) -> str:
        """Generate .env.example from .env"""
        try:
            env_path = self.project_path / '.env'
            with open(env_path, 'r') as f:
                lines = []
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key = line.split('=')[0]
                            lines.append(f"{key}=")
                        else:
                            lines.append(line)
                    else:
                        lines.append(line)
                
                return '\n'.join(lines)
        except Exception:
            return "# Environment variables\n"
    
    def _generate_readme(self, project_type: str) -> str:
        """Generate basic README.md"""
        return f"""# Project Name

## Description

Add your project description here.

## Installation

```bash
# Add installation instructions
```

## Usage

```bash
# Add usage instructions
```

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

This is a {project_type} project.

## License

Add license information here.
"""
    
    def get_deployment_configs(self) -> List[ConfigFile]:
        """Get only deployment-related configs"""
        all_configs = self.detect_all()
        return [
            c for c in all_configs 
            if c.type in {ConfigType.DEPLOYMENT, ConfigType.DOCKER, ConfigType.ENVIRONMENT}
        ]
    
    def check_deployment_readiness(self) -> Dict[str, Any]:
        """Check if project is ready for deployment"""
        configs = self.detect_all()
        
        has_dockerfile = any(c.path == 'Dockerfile' for c in configs)
        has_dockerignore = any(c.path == '.dockerignore' for c in configs)
        has_env_example = any(c.path == '.env.example' for c in configs)
        has_readme = any('readme' in c.path.lower() for c in configs)
        
        all_issues = []
        for config in configs:
            all_issues.extend(config.issues)
        
        missing = []
        if not has_dockerfile:
            missing.append('Dockerfile')
        if not has_dockerignore:
            missing.append('.dockerignore')
        if not has_env_example and any(c.path.startswith('.env') for c in configs):
            missing.append('.env.example')
        if not has_readme:
            missing.append('README.md')
        
        return {
            'ready': len(missing) == 0 and len(all_issues) == 0,
            'missing_files': missing,
            'issues': all_issues,
            'config_count': len(configs)
        }
