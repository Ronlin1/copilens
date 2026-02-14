"""
Architecture Detection for Copilens
Auto-detects project type, framework, and structure
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from enum import Enum
import json


class ProjectType(Enum):
    """Project type categories"""
    FRONTEND = "frontend"
    BACKEND = "backend"
    FULLSTACK = "fullstack"
    MOBILE = "mobile"
    DESKTOP = "desktop"
    LIBRARY = "library"
    CLI = "cli"
    UNKNOWN = "unknown"


class Framework(Enum):
    """Common frameworks"""
    REACT = "react"
    VUE = "vue"
    ANGULAR = "angular"
    SVELTE = "svelte"
    NEXT = "nextjs"
    NUXT = "nuxtjs"
    
    EXPRESS = "express"
    FASTAPI = "fastapi"
    DJANGO = "django"
    FLASK = "flask"
    NESTJS = "nestjs"
    RAILS = "rails"
    SPRINGBOOT = "springboot"
    
    REACT_NATIVE = "react-native"
    FLUTTER = "flutter"
    ELECTRON = "electron"
    
    UNKNOWN = "unknown"


class Language(Enum):
    """Programming languages"""
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    PYTHON = "python"
    JAVA = "java"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"
    PHP = "php"
    RUBY = "ruby"
    SWIFT = "swift"
    KOTLIN = "kotlin"
    UNKNOWN = "unknown"


@dataclass
class ProjectArchitecture:
    """Detected project architecture"""
    project_type: ProjectType
    primary_language: Language
    frameworks: List[Framework]
    has_frontend: bool
    has_backend: bool
    has_database: bool
    package_manager: Optional[str]
    build_tool: Optional[str]
    config_files: List[str]
    dependencies: Dict[str, List[str]]
    deployment_ready: bool
    missing_configs: List[str]
    recommended_platform: Optional[str]


class ArchitectureDetector:
    """Detects project architecture and configuration"""
    
    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.files = self._scan_files()
    
    def _scan_files(self) -> Set[str]:
        """Scan project files"""
        files = set()
        try:
            for root, dirs, filenames in os.walk(self.project_path):
                # Skip common ignore directories
                dirs[:] = [d for d in dirs if d not in {
                    'node_modules', '__pycache__', '.git', 'venv', 
                    'env', 'dist', 'build', '.next', '.nuxt'
                }]
                
                for filename in filenames:
                    rel_path = os.path.relpath(
                        os.path.join(root, filename), 
                        self.project_path
                    )
                    files.add(rel_path)
        except Exception:
            pass
        
        return files
    
    def detect(self) -> ProjectArchitecture:
        """Detect full project architecture"""
        
        # Detect language
        language = self._detect_language()
        
        # Detect frameworks
        frameworks = self._detect_frameworks()
        
        # Detect project type
        project_type = self._detect_project_type(frameworks)
        
        # Check components
        has_frontend = self._has_frontend()
        has_backend = self._has_backend()
        has_database = self._has_database()
        
        # Package manager
        package_manager = self._detect_package_manager()
        
        # Build tool
        build_tool = self._detect_build_tool()
        
        # Config files
        config_files = self._find_config_files()
        
        # Dependencies
        dependencies = self._extract_dependencies()
        
        # Deployment readiness
        deployment_ready, missing_configs = self._check_deployment_readiness()
        
        # Recommended platform
        recommended_platform = self._recommend_platform(
            project_type, frameworks, language
        )
        
        return ProjectArchitecture(
            project_type=project_type,
            primary_language=language,
            frameworks=frameworks,
            has_frontend=has_frontend,
            has_backend=has_backend,
            has_database=has_database,
            package_manager=package_manager,
            build_tool=build_tool,
            config_files=config_files,
            dependencies=dependencies,
            deployment_ready=deployment_ready,
            missing_configs=missing_configs,
            recommended_platform=recommended_platform
        )
    
    def _detect_language(self) -> Language:
        """Detect primary programming language"""
        extensions = {}
        
        for file in self.files:
            ext = Path(file).suffix.lower()
            extensions[ext] = extensions.get(ext, 0) + 1
        
        # Language mapping
        if extensions.get('.ts', 0) + extensions.get('.tsx', 0) > 0:
            return Language.TYPESCRIPT
        elif extensions.get('.js', 0) + extensions.get('.jsx', 0) > 0:
            return Language.JAVASCRIPT
        elif extensions.get('.py', 0) > 0:
            return Language.PYTHON
        elif extensions.get('.java', 0) > 0:
            return Language.JAVA
        elif extensions.get('.cs', 0) > 0:
            return Language.CSHARP
        elif extensions.get('.go', 0) > 0:
            return Language.GO
        elif extensions.get('.rs', 0) > 0:
            return Language.RUST
        elif extensions.get('.php', 0) > 0:
            return Language.PHP
        elif extensions.get('.rb', 0) > 0:
            return Language.RUBY
        elif extensions.get('.swift', 0) > 0:
            return Language.SWIFT
        elif extensions.get('.kt', 0) > 0:
            return Language.KOTLIN
        
        return Language.UNKNOWN
    
    def _detect_frameworks(self) -> List[Framework]:
        """Detect frameworks used"""
        frameworks = []
        
        # Check package.json for Node.js frameworks
        if 'package.json' in self.files:
            deps = self._read_package_json_deps()
            
            if 'next' in deps:
                frameworks.append(Framework.NEXT)
            elif 'nuxt' in deps:
                frameworks.append(Framework.NUXT)
            elif 'react' in deps:
                frameworks.append(Framework.REACT)
            elif 'vue' in deps:
                frameworks.append(Framework.VUE)
            elif '@angular/core' in deps:
                frameworks.append(Framework.ANGULAR)
            elif 'svelte' in deps:
                frameworks.append(Framework.SVELTE)
            
            if 'express' in deps:
                frameworks.append(Framework.EXPRESS)
            elif '@nestjs/core' in deps:
                frameworks.append(Framework.NESTJS)
            
            if 'react-native' in deps:
                frameworks.append(Framework.REACT_NATIVE)
            elif 'electron' in deps:
                frameworks.append(Framework.ELECTRON)
        
        # Check Python frameworks
        if 'requirements.txt' in self.files or 'pyproject.toml' in self.files:
            deps = self._read_python_deps()
            
            if 'fastapi' in deps:
                frameworks.append(Framework.FASTAPI)
            elif 'django' in deps:
                frameworks.append(Framework.DJANGO)
            elif 'flask' in deps:
                frameworks.append(Framework.FLASK)
        
        # Check Ruby
        if 'Gemfile' in self.files:
            frameworks.append(Framework.RAILS)
        
        # Check Java
        if 'pom.xml' in self.files or 'build.gradle' in self.files:
            frameworks.append(Framework.SPRINGBOOT)
        
        return frameworks if frameworks else [Framework.UNKNOWN]
    
    def _detect_project_type(self, frameworks: List[Framework]) -> ProjectType:
        """Detect project type"""
        frontend_frameworks = {
            Framework.REACT, Framework.VUE, Framework.ANGULAR, 
            Framework.SVELTE, Framework.NEXT, Framework.NUXT
        }
        backend_frameworks = {
            Framework.EXPRESS, Framework.FASTAPI, Framework.DJANGO,
            Framework.FLASK, Framework.NESTJS, Framework.RAILS,
            Framework.SPRINGBOOT
        }
        mobile_frameworks = {Framework.REACT_NATIVE, Framework.FLUTTER}
        desktop_frameworks = {Framework.ELECTRON}
        
        has_frontend_fw = any(f in frontend_frameworks for f in frameworks)
        has_backend_fw = any(f in backend_frameworks for f in frameworks)
        has_mobile_fw = any(f in mobile_frameworks for f in frameworks)
        has_desktop_fw = any(f in desktop_frameworks for f in frameworks)
        
        if has_mobile_fw:
            return ProjectType.MOBILE
        elif has_desktop_fw:
            return ProjectType.DESKTOP
        elif has_frontend_fw and has_backend_fw:
            return ProjectType.FULLSTACK
        elif has_frontend_fw:
            return ProjectType.FRONTEND
        elif has_backend_fw:
            return ProjectType.BACKEND
        elif self._is_library():
            return ProjectType.LIBRARY
        elif self._is_cli():
            return ProjectType.CLI
        
        return ProjectType.UNKNOWN
    
    def _has_frontend(self) -> bool:
        """Check if project has frontend"""
        frontend_indicators = [
            'package.json', 'index.html', 'public/index.html',
            'src/App.js', 'src/App.tsx', 'src/main.ts'
        ]
        return any(f in self.files for f in frontend_indicators)
    
    def _has_backend(self) -> bool:
        """Check if project has backend"""
        backend_indicators = [
            'server.js', 'app.py', 'main.py', 'api/',
            'routes/', 'controllers/', 'models/'
        ]
        for indicator in backend_indicators:
            if indicator in self.files:
                return True
            # Check if any file starts with directory indicator
            if indicator.endswith('/'):
                if any(f.startswith(indicator) for f in self.files):
                    return True
        return False
    
    def _has_database(self) -> bool:
        """Check if project uses database"""
        db_indicators = [
            'prisma/', 'migrations/', 'models/', 
            'database.py', 'db.py', 'schema.sql'
        ]
        for indicator in db_indicators:
            if indicator in self.files:
                return True
            # Check if any file starts with directory indicator
            if indicator.endswith('/'):
                if any(f.startswith(indicator) for f in self.files):
                    return True
        return False
    
    def _is_library(self) -> bool:
        """Check if project is a library"""
        return 'setup.py' in self.files or 'lib/' in str(self.files)
    
    def _is_cli(self) -> bool:
        """Check if project is a CLI tool"""
        cli_indicators = ['bin/', 'cli.py', 'cli.js', '__main__.py']
        return any(f in self.files for f in cli_indicators)
    
    def _detect_package_manager(self) -> Optional[str]:
        """Detect package manager"""
        if 'package-lock.json' in self.files:
            return "npm"
        elif 'yarn.lock' in self.files:
            return "yarn"
        elif 'pnpm-lock.yaml' in self.files:
            return "pnpm"
        elif 'requirements.txt' in self.files or 'pyproject.toml' in self.files:
            return "pip"
        elif 'Gemfile.lock' in self.files:
            return "bundler"
        elif 'go.mod' in self.files:
            return "go"
        return None
    
    def _detect_build_tool(self) -> Optional[str]:
        """Detect build tool"""
        if 'vite.config.js' in self.files or 'vite.config.ts' in self.files:
            return "vite"
        elif 'webpack.config.js' in self.files:
            return "webpack"
        elif 'rollup.config.js' in self.files:
            return "rollup"
        elif 'tsconfig.json' in self.files:
            return "tsc"
        elif 'setup.py' in self.files:
            return "setuptools"
        return None
    
    def _find_config_files(self) -> List[str]:
        """Find all configuration files"""
        config_patterns = [
            'package.json', 'tsconfig.json', 'vite.config', 'webpack.config',
            'requirements.txt', 'pyproject.toml', 'setup.py',
            '.env', '.env.example', 'docker-compose.yml', 'Dockerfile',
            'vercel.json', 'netlify.toml', 'railway.json',
            '.gitignore', '.dockerignore', 'Procfile'
        ]
        
        found = []
        for pattern in config_patterns:
            for file in self.files:
                if pattern in file:
                    found.append(file)
        
        return list(set(found))
    
    def _extract_dependencies(self) -> Dict[str, List[str]]:
        """Extract dependencies"""
        deps = {}
        
        # Node.js
        if 'package.json' in self.files:
            deps['npm'] = list(self._read_package_json_deps().keys())
        
        # Python
        if 'requirements.txt' in self.files:
            deps['pip'] = list(self._read_python_deps().keys())
        
        return deps
    
    def _read_package_json_deps(self) -> Dict[str, str]:
        """Read package.json dependencies"""
        try:
            with open(self.project_path / 'package.json', 'r') as f:
                data = json.load(f)
                deps = {}
                deps.update(data.get('dependencies', {}))
                deps.update(data.get('devDependencies', {}))
                return deps
        except Exception:
            return {}
    
    def _read_python_deps(self) -> Dict[str, str]:
        """Read Python dependencies"""
        deps = {}
        try:
            if 'requirements.txt' in self.files:
                with open(self.project_path / 'requirements.txt', 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            pkg = line.split('==')[0].split('>=')[0].strip()
                            deps[pkg] = line
        except Exception:
            pass
        
        return deps
    
    def _check_deployment_readiness(self) -> tuple[bool, List[str]]:
        """Check if project is deployment ready"""
        missing = []
        
        # Check for Dockerfile
        if 'Dockerfile' not in self.files:
            missing.append('Dockerfile')
        
        # Check for .dockerignore
        if '.dockerignore' not in self.files:
            missing.append('.dockerignore')
        
        # Check for .env.example
        if '.env' in self.files and '.env.example' not in self.files:
            missing.append('.env.example')
        
        # Check for README
        readme_files = [f for f in self.files if f.lower().startswith('readme')]
        if not readme_files:
            missing.append('README.md')
        
        return (len(missing) == 0, missing)
    
    def _recommend_platform(
        self, 
        project_type: ProjectType,
        frameworks: List[Framework],
        language: Language
    ) -> Optional[str]:
        """Recommend deployment platform"""
        
        # Next.js / React → Vercel
        if Framework.NEXT in frameworks:
            return "vercel"
        
        # Vue / Nuxt → Netlify
        if Framework.VUE in frameworks or Framework.NUXT in frameworks:
            return "netlify"
        
        # Python backends → Railway
        if language == Language.PYTHON and project_type == ProjectType.BACKEND:
            return "railway"
        
        # Node.js backends → Railway or Render
        if language in {Language.JAVASCRIPT, Language.TYPESCRIPT}:
            if project_type == ProjectType.BACKEND:
                return "railway"
        
        # Static sites → Netlify
        if project_type == ProjectType.FRONTEND:
            return "netlify"
        
        # Fullstack → Vercel
        if project_type == ProjectType.FULLSTACK:
            return "vercel"
        
        # Docker → Cloud Run
        if 'Dockerfile' in self.files:
            return "cloudrun"
        
        return "railway"  # Default fallback
